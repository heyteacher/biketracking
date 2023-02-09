set -x;
convert icon.png -resize 144x144 ../App_Resources/Android/src/main/res/drawable-xxhdpi/icon.png
convert icon.png -resize 96x96 ../App_Resources/Android/src/main/res/drawable-xhdpi/icon.png
convert icon.png -resize 72x72 ../App_Resources/Android/src/main/res/drawable-hdpi/icon.png
convert icon.png -resize 48x48 ../App_Resources/Android/src/main/res/drawable-mdpi/icon.png
convert icon.png -resize 36x36 ../App_Resources/Android/src/main/res/drawable-ldpi/icon.png

convert logo.png -resize 576x768 ../App_Resources/Android/src/main/res/drawable-xxhdpi/logo.png
convert logo.png -resize 384x512 ../App_Resources/Android/src/main/res/drawable-xhdpi/logo.png
convert logo.png -resize 288x384 ../App_Resources/Android/src/main/res/drawable-hdpi/logo.png
convert logo.png -resize 192x256 ../App_Resources/Android/src/main/res/drawable-mdpi/logo.png
convert logo.png -resize 144x192 ../App_Resources/Android/src/main/res/drawable-ldpi/logo.png

convert background.png -resize 1152x1536 +profile "icc" ../App_Resources/Android/src/main/res/drawable-xxhdpi/background.png
convert background.png -resize 768x1024 +profile "icc" ../App_Resources/Android/src/main/res/drawable-xhdpi/background.png
convert background.png -resize 576x768 +profile "icc" ../App_Resources/Android/src/main/res/drawable-hdpi/background.png
convert background.png -resize 184x512 +profile "icc" ../App_Resources/Android/src/main/res/drawable-mdpi/background.png
convert background.png -resize 288x384 +profile "icc" ../App_Resources/Android/src/main/res/drawable-ldpi/background.png


