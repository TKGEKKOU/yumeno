from pathlib import Path
import sys

from starlette.staticfiles import StaticFiles


STATIC_DIR = (
    Path(sys.executable).parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parents[2]
) / "static"


class NoCacheStaticFiles(StaticFiles):
    """静态资源允许缓存但必须重新验证，避免 WebView2/浏览器启发式缓存导致改了不生效。"""

    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "no-store"
        return response
