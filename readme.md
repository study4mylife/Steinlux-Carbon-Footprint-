# Github使用方法(請按照順序才不會出錯)
## 先將repo檔案拉到本地(一定要做!!)
git checkout main <br>
git pull origin main

## 切換回你的開發分支
如果還沒有分支，可以用下面指令新建並切換<br>
git checkout -b 新分支名稱<br>
如果已經有分支，直接切換:<br>
git checkout 你的分支名稱<br>
EX: git checkout -b TZUFU<br>

## 如何將改動推送至Github?
在vscode中的左上角打開終端機<br>
輸入以下三行程式碼:<br>
git add . (將所有改動過的檔案做追蹤)<br>
git commit -m "輸入本次修改訊息" (將檔案做快照)<br>
EX: git commit -m "修改index.html"<br>
git push -u origin 你的分支 (將檔案推送到HOW這個分支)<br>
EX: git push -u origin HOW<br>


# 網頁預覽
[主頁](https://study4mylife.github.io/Steinlux-Carbon-Footprint-/Steinlux-Carbon-Footprint/index.html)

[日常交通](https://study4mylife.github.io/Steinlux-Carbon-Footprint-/Steinlux-Carbon-Footprint/traffic-daily.html)

[居住](https://study4mylife.github.io/Steinlux-Carbon-Footprint-/Steinlux-Carbon-Footprint/home.html)

[飲食](https://study4mylife.github.io/Steinlux-Carbon-Footprint-/Steinlux-Carbon-Footprint/food.html)

[娛樂](https://study4mylife.github.io/Steinlux-Carbon-Footprint-/Steinlux-Carbon-Footprint/entertainment.html)

[時尚](https://study4mylife.github.io/Steinlux-Carbon-Footprint-/Steinlux-Carbon-Footprint/fashion.html)


