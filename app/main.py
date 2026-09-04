from fastapi import FastAPI
from extensions.catalog import CatalogClient

from settings import Settings

from app.startup.lifespan import build_lifespan
from app.startup.resources import (
    initialize_agent_runtime,
    initialize_database_and_core,
    initialize_integration_resources,
    initialize_voice_resources,
)
from app.startup.routes import configure_middleware, mount_static_files, register_routes


def create_app(initialize_database: bool = True) -> FastAPI:
    settings = Settings.load()
    app = FastAPI(title="YUMENO", lifespan=build_lifespan(settings, initialize_database=initialize_database))
    app.state.settings = settings
    app.state.extension_catalog_client = CatalogClient(settings.project_root)
    app.state.extension_installer = None
    configure_middleware(app)
    initialize_database_and_core(app, settings)
    initialize_voice_resources(app, settings)
    initialize_agent_runtime(app, settings, initialize_database=initialize_database)
    initialize_integration_resources(app, settings)
    register_routes(app, settings)
    mount_static_files(app, settings)
    return app
