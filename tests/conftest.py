import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_session
from app.main import create_app


@pytest.fixture
def db_session() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture
def client(db_session: Session):
    app = create_app(initialize_database=False)
    # 后台 Worker 与请求线程必须各自持有 Session；共享同一个 Session
    # 会触发 SQLAlchemy 的 identity map/transaction 并发状态错误。
    app.state.session_factory = sessionmaker(
        bind=db_session.get_bind(),
        expire_on_commit=False,
    )
    def override_session():
        yield db_session

    app.dependency_overrides[get_session] = override_session
    with TestClient(app, base_url="http://localhost") as test_client:
        yield test_client
