from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[1]; S=R/'.screenshots/source/rvc-workflow-20260905/captures'; O=R/'docs/images/yumeno-rvc-workflow-full.gif'; W,H=1600,980
fs=sorted(S.glob('*.png'),key=lambda p:(p.stat().st_mtime,p.name)); frames=[]
for f in fs:
 im=Image.open(f).convert('RGB'); im.thumbnail((1530,860),Image.Resampling.LANCZOS); w,h=im.width,im.height+48; c=Image.new('RGB',(W,H),(232,237,242)); x,y=(W-w)//2,(H-h)//2; b=Image.new('RGB',(w,h),'white'); d=ImageDraw.Draw(b); d.rectangle((0,0,w,48),fill='#edf2f6'); [d.ellipse((a,18,a+12,30),fill=z) for a,z in ((18,'#ff6b6b'),(38,'#ffd166'),(58,'#5bd68b'))]; d.rounded_rectangle((102,12,w-24,38),radius=13,fill='#dfe7ee'); d.text((120,18),'127.0.0.1:17000  ·  YUMENO',fill='#536579'); b.paste(im,(0,48)); c.paste(b,(x,y)); frames.append(c.convert('P',palette=Image.Palette.ADAPTIVE,colors=192))
d=[1700 if i<3 else 1800 if i in (15,16,32,37) else 4000 if i==len(fs)-1 else 1050 for i in range(len(fs))]; O.parent.mkdir(parents=True,exist_ok=True); frames[0].save(O,save_all=True,append_images=frames[1:],duration=d,loop=0,optimize=False,disposal=2); print(f'generated {O}: {len(frames)} frames')
