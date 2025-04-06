function composite(bgImg, fgImg, fgOpac, fgPos) {

    const startX = 0;
    const startY = 0;

    const endX = bgImg.width;
    const endY = bgImg.height;

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            
            var posX = x + fgPos.x;
            var posY = y + fgPos.y;

            if (posX < 0 || posX >= bgImg.width || posY < 0 || posY >= bgImg.height) {
                continue; 
            }

            var i = (y * fgImg.width + x) * 4;
            var bg_i = (posY * bgImg.width + posX) * 4;
            var alpha = (fgImg.data[i + 3] / 255) * fgOpac;

            bgImg.data[bg_i] = fgImg.data[i] * alpha + bgImg.data[bg_i] * (1-alpha);
            bgImg.data[bg_i + 1] = fgImg.data[i + 1] * alpha + bgImg.data[bg_i + 1] * (1-alpha);
            bgImg.data[bg_i + 2] = fgImg.data[i + 2] * alpha + bgImg.data[bg_i + 2] * (1-alpha);
            bgImg.data[bg_i + 3] = 255;
        }
    }
}