from PIL import Image
import pillow_heif
pillow_heif.register_heif_opener()
path='assets/img/Rocks/rocks_pt3.heic'
try:
    im=Image.open(path)
    im.load()
    print('OK', im.mode, im.size)
    im.convert('RGB').save('assets/img/optimized_test_rocks_pt3.jpg', format='JPEG', quality=85)
    print('WROTE assets/img/optimized_test_rocks_pt3.jpg')
except Exception as e:
    print('ERR', e)
