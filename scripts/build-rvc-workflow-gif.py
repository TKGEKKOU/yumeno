"""Build the README RVC workflow GIF from local, git-ignored source captures.

The source captures are intentionally kept outside Git in .screenshots/source/.
Only the normalized showcase GIF is published under docs/images/.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".screenshots" / "source"
OUTPUT = ROOT / "docs" / "images" / "yumeno-rvc-workflow.gif"
FRAMES = [
    ("01-upload-video.png", 1900),
    ("02-separated-vocals-instrumental.png", 1900),
    ("04-conversion-result.png", 3000),
]
SIZE = (1600, 900)


def load_frame(name: str) -> Image.Image:
    source = SOURCE / name
    if not source.exists():
        raise FileNotFoundError(f"缺少截图素材：{source}")
    image = Image.open(source).convert("RGB")
    image.thumbnail(SIZE, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", SIZE, "white")
    canvas.paste(image, ((SIZE[0] - image.width) // 2, (SIZE[1] - image.height) // 2))
    return canvas.convert("P", palette=Image.Palette.ADAPTIVE, colors=192)


OUTPUT.parent.mkdir(parents=True, exist_ok=True)
frames = [load_frame(name) for name, _ in FRAMES]
frames[0].save(
    OUTPUT,
    save_all=True,
    append_images=frames[1:],
    duration=[duration for _, duration in FRAMES],
    loop=0,
    optimize=False,
    disposal=2,
)
print(f"已生成 {OUTPUT}（{len(frames)} 帧，{OUTPUT.stat().st_size} bytes）")
