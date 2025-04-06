function composite(bgImg, fgImg, fgOpac, fgPos) {
    for (let y = 0; y < fgImg.height; y++) {
        for (let x = 0; x < fgImg.width; x++) {
            const bgX = x + fgPos.x;
            const bgY = y + fgPos.y;
            
            if (bgX < 0 || bgX >= bgImg.width || bgY < 0 || bgY >= bgImg.height) {
                continue;
            }
            
            const fgIndex = (y * fgImg.width + x) * 4;
            const bgIndex = (bgY * bgImg.width + bgX) * 4;
            
            const fgAlpha = (fgImg.data[fgIndex + 3] / 255) * fgOpac;
            
            if (fgAlpha === 0) continue;
            
            const bgAlpha = bgImg.data[bgIndex + 3] / 255;
            const outAlpha = fgAlpha + bgAlpha * (1 - fgAlpha);
            
            // Blend color channels
            for (let i = 0; i < 3; i++) {
                bgImg.data[bgIndex + i] = Math.round(
                    fgImg.data[fgIndex + i] * fgAlpha + 
                    bgImg.data[bgIndex + i] * bgAlpha * (1 - fgAlpha)
                );
            }
            
            bgImg.data[bgIndex + 3] = Math.round(outAlpha * 255);
        }
    }
}