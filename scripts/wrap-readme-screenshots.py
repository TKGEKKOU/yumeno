from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import sys
ROOT = Path(__file__).resolve().parents[1]; OUT = ROOT / "docs" / "images"
W,H=1540,1010; CHROME=54

def wrap(stem, transparent=False):
    raw_path=OUT/f"{stem}.raw.png"; raw=Image.open(raw_path).convert("RGB")
    max_w,max_h=W-100,H-CHROME-90; scale=min(max_w/raw.width,max_h/raw.height)
    content=raw.resize((round(raw.width*scale),round(raw.height*scale)),Image.Resampling.LANCZOS)
    frame_w,frame_h=content.width,content.height+CHROME
    if transparent: canvas=Image.new("RGBA",(frame_w+36,frame_h+36),(0,0,0,0)); x=y=18
    else:
        canvas=Image.new("RGBA",(W,H),(7,18,31,255)); x,y=(W-frame_w)//2,(H-frame_h)//2
        glow=Image.new("RGBA",canvas.size,(0,0,0,0)); gd=ImageDraw.Draw(glow); gd.ellipse((W-500,-250,W+200,450),fill=(54,210,204,65)); gd.ellipse((-300,H-350,450,H+200),fill=(50,120,230,55)); canvas=Image.alpha_composite(canvas,glow.filter(ImageFilter.GaussianBlur(70)))
    if not transparent:
        shadow=Image.new("RGBA",canvas.size,(0,0,0,0)); sd=ImageDraw.Draw(shadow); sd.rounded_rectangle((x+8,y+14,x+frame_w+8,y+frame_h+14),radius=18,fill=(0,0,0,150)); canvas=Image.alpha_composite(canvas,shadow.filter(ImageFilter.GaussianBlur(18)))
    frame=Image.new("RGB",(frame_w,frame_h),"#f7fafc"); d=ImageDraw.Draw(frame); d.rounded_rectangle((0,0,frame_w-1,frame_h-1),radius=18,fill="#f7fafc",outline="#b7c5d4",width=1); d.rectangle((0,0,frame_w,CHROME),fill="#eaf0f5"); d.ellipse((20,20,32,32),fill="#ff6b6b"); d.ellipse((40,20,52,32),fill="#ffd166"); d.ellipse((60,20,72,32),fill="#5bd68b"); d.rounded_rectangle((105,14,frame_w-24,40),radius=13,fill="#dce6ee"); d.text((122,20),"127.0.0.1:17000  ·  YUMENO",fill="#526579"); frame.paste(content,(0,CHROME))
    mask=Image.new("L",(frame_w,frame_h),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,frame_w,frame_h),radius=18,fill=255); canvas.paste(frame,(x,y),mask); canvas.save(OUT/f"{stem}.png",optimize=True); raw_path.unlink()

names=sys.argv[1:] or ["yumeno-conversation-workbench","yumeno-rvc-task","yumeno-system-status"]
for n in names: wrap(n, n.endswith("-demo"))
