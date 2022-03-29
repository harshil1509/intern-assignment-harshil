# intern-assignment-harshil
# Content Service Api's : 
# (i) Fetch all content with content meta-data like episodes, title etc : http://localhost:3001/series/get
# (ii) Content meta with only unlocked chapters per series : http://localhost:3001/user/get/unlockedPerSeries
# (iii) Creating new user : http://localhost:3001/create/user (give userId)
# (iv) Posting new series : http://localhost:3001/series (give title and episodes array) {Api for bulk upload}
# (v) Count of total episodes : http://localhost:3001/user/totalep
# (vi) Count of unlocked episodes : http://localhost:3001/user/unlockedEp
# (v) Unlocking chapters : http://localhost:3001/update 

# USER AND DAILY PASS SERVICE
# (i) Create new chapter with title and chapters array : http://localhost:3001/create/newchapter
# (ii) Creating new user : http://localhost:3001/create/newuser
# (iii) Fetch all users : http://localhost:3001/newUser/all
# (iv) Multiple clicks increment :  http://localhost:3001/update/foruser (give email and chapterTitle)
