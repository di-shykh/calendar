(function () {
    window.addEventListener("load", function () {
        var events = JSON.parse(localStorage.getItem("events")) || [];
        var today = new Date();
        var month = today.getMonth();
        var year = today.getFullYear();
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
        var weekNames = ["Monday,", "Tuesday,", "Wednesday,", "Thursday,", "Friday,", "Saturday,", "Sunday,"];
        var smallWeekNames = ["Mon,", "Tue,", "Wed,", "Thu,", "Fri,", "Sat,", "Sun,"];

        /*create calendar for this month*/
        function createCalendar(month, year, today) {
            var spanWithMonth = document.querySelector("#month");
            spanWithMonth.innerHTML = monthNames[month] + ", " + year;
             //var numDays = daysInThisMonth();
            /*first and last days in this month*/
            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            var calendar = document.querySelector(".calendar");
            var table="<table><tr>";
            /*create first row with days of week*/
            if ($(document).width() >= 700) {
                for (var i = 0; i < weekNames.length; i++) {
                    table += "<td>" + weekNames[i] + "</td>";
                }
            }
            else {
                for (var i = 0; i < smallWeekNames.length; i++) {
                    table += "<td>" + smallWeekNames[i] + "</td>";
                }
            }
            /*create 4 row for calendar*/
            table += "</tr>";
            for (i = 0; i < 5; i++) {
                table += "<tr>";
                for (var j = 0; j < 7; j++) {
                    table += "<td></td>";
                }
                table += "</tr>";
            }
            table+="</table>";
            calendar.innerHTML = table;
            var count = 0;
            var tempDate;
            /*count days before first day of month*/
            for (i = 0; i < firstDay.getDay() - 1 ; i++) {
                count++;
               // $("td")[i].innerHTML += "";
            }
            var day = 0;
            /*write in cells days of month*/
            for (i = 0; i < lastDay.getDate() ; i++) {
                day++;
                if (day <= lastDay.getDate()) {
                    $("td")[count].innerHTML += day;
                    $("td")[count].className += "current";
                    tempDate=new Date(year, month, day);
                    createHiddenElement(tempDate, $("td")[count]);
                    count++;                   
                }
            }
            /*find today in calendar*/
            if(today){
                var temp, str;
                for (i = 0; i < 35; i++) {
                    str = $("td").eq(i).find("div").text();
                    temp=new Date(str);
                    if (temp.getDate() == today.getDate()&&temp.getMonth()==today.getMonth()&&temp.getFullYear()==today.getFullYear())
                        $("td").eq(i).addClass("today");
                }
            }
            /*add dates for previous month*/
            var date = firstDay;
            if (firstDay.getDay() != 1) {
                for (i = firstDay.getDay() - 2; i >= 0 ; i--) {
                    date.setDate(date.getDate() - 1);
                    $("td")[i].innerHTML += date.getDate();
                    createHiddenElement(date, $("td")[i]);
                }
            }
            if(count<42){
                var dateLast=lastDay;
                for(i=count;i<42;i++){
                    dateLast.setDate(dateLast.getDate()+1);
                    $("td")[i].innerHTML += dateLast.getDate();
                    createHiddenElement(dateLast, $("td")[i]);
                }
            }
            /*add or edit event by click on the day*/
            $("td").click(function () {
                var pos = $(this).offset();
                var h = $(this).height();
                var w = $(this).width();
                var off = false;
                var widthOfPopupForms = 250;
                /*if popup element is out of the window*/
                if ((pos.left + w + 10 + widthOfPopupForms) > $(window).width())
                    off = true;
                if (!$(this).hasClass("event")) {              
                    var date = readDateFromHiddenElement($(this));
                    $("[name=date]").val(date.toISOString().substr(0, 10));
                    if (!off)
                        $(".formForEvent").css({ left: pos.left + w + 10, top: pos.top + 10 });
                    else {
                        if (pos.left + w - 10 - widthOfPopupForms>0)
                            $(".formForEvent").css({ left: pos.left + w - 10 - widthOfPopupForms, top: pos.top + 10 });
                        else
                            /*if popup element is out of the window*/
                            $(".formForEvent").css({ left: 10, top: pos.top + 10 });
                    }
                    $(".formForEvent").fadeIn(600);
                    $(".formForEvent input[name=event]").attr('requered','required');
                    $(".formForEvent input[name=participant]").attr('requered','required');
                    $(".formForEvent input[name=date]").attr('requered','required');
                }
                if ($(this).hasClass("event")) {
                    if (!off)
                        $(".formForEditEvent").css({ left: pos.left + w + 10, top: pos.top + 10 });
                    else {
                        if (pos.left + w - 10 - widthOfPopupForms > 0)
                            $(".formForEditEvent").css({ left: pos.left + w - 10 - widthOfPopupForms, top: pos.top + 10 });
                        else
                            /*if popup element is out of the window*/
                            $(".formForEditEvent").css({ left: 10, top: pos.top + 10 });
                    } 
                    $(".formForEditEvent").fadeIn(600);
                    /*----------------------------------------------------- */                  
                    var  dateFromElem = readDateFromHiddenElement($(this));
                    var event=findEventInArray(dateFromElem);
                    var str=event.name;
                    $(".formForEditEvent #event").text(str);
                    str = dateFromElem.toISOString().substr(0, 10);
                    $(".formForEditEvent #date").text(str);
                    str=event.participants;
                    $(".formForEditEvent #participants").text(str);
                    str=event.description;
                    if(str)
                        $(".formForEditEvent [name=description]").text(str); 
                }
                $(window).unbind("click").on('click', function (e) {
                    if (e.target.name == "del"){
                        deleteEvent(event);
                    }
                    if (e.target.name == "ok")
                        if ($(e.target).parent().parent().prop('className') == "formForEditEvent"){
                            refreshEvent(event);
                        }
                    if ((e.target.name=="x"||e.target.name=="cancel")&&$(e.target).parent().parent().prop('className') == "formForEvent"){
                        var requiredInputs=$(".formForEvent [required]"); 
                        for(i=0;i<requiredInputs.length;i++){
                            requiredInputs[i].setCustomValidity("");
                        }
                        //requiredInputs.css('border', '1px solid #808080');
                        //requiredInputs.css('box-shadow', 'none');
                        $(".formForEvent").hide();
                        //resetForms();
                        if(event){
                            event.stopPropagation();
                            event.preventDefault();
                        }
                        var curDate=findDomDate();                      
                        createCalendar($.inArray(curDate[0],monthNames),parseInt(curDate[1]), today);
                    }
                });
            });
            
            
            //$("button[name=cancel]").click(cancel());
            $(".shortFormEvent button[name=x]").click(function () {
                //$("[name=eventWithDate]").required = false;
                //$(".shortFormEvent input[name=eventWithDate]").IsValid = true;
                //$(".shortFormEvent input[name=eventWithDate]").oninvalid = document.getElementsByName("eventWithDate")[0].setCustomValidity("");
                $(".shortFormEvent input[name=eventWithDate]").oninvalid = this.setCustomValidity('');
                $(".shortFormEvent").hide();
            });
            $("#add").click(function () {
                var pos = $(this).offset();
                var h = $(this).height();
                var w = $(this).width();
                $(".shortFormEvent").css({ left: pos.left, top: pos.top + h + 15 });
                $(".shortFormEvent").fadeIn(600);
                $("[name=eventWithDate]").required = true;
                $("[name=eventWithDate]").focus();
            });

            $("#refresh").click(function () {
               location.reload();
            })
            //add event to localstorage
            $("[name=ok]").unbind("click").click(function () {
                if($("[name=event]").val().length&&$("[name=participant]").val().length&&$("[name=date]").val().length){
                    var event = new Event();
                    event.name = $("[name=event]").val();
                    date = parseDate($("[name=date]").val());
                    if (date) {
                        var day = date.getDate();
                        var month = date.getMonth();
                        var year = date.getFullYear();
                    }
                    event.date = new Date(year, month, day);
                    event.participants = $("[name=participant]").val();
                    event.description = $("[name=description]").val();
                    events.push(event);
                    localStorage.setItem('events', JSON.stringify(events));
                }
            });
            findEvets();
        }
        function createHiddenElement(date, elem) {
            var hiddenDate, divWithDate;
            hiddenDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            divWithDate = $("<div>", { css: { display: 'none' } });
            divWithDate.html(hiddenDate);
            divWithDate.appendTo(elem);
        }

        createCalendar(month,year,today);
        function findDomDate(){
            var arrForMonth;
            var strForMonth=$("#month").text();
            arrForMonth=strForMonth.split(",");
            return arrForMonth;
        }
        $("#left").click(function () {
            var arrForMonth=findDomDate();       
            var monthFromDOM=$.inArray(arrForMonth[0],monthNames);
            if(monthFromDOM){
                newMonth=new Date(arrForMonth[1],monthFromDOM,1);
                newMonth.setMonth(newMonth.getMonth()-1);
                $("#month").text(monthNames[newMonth.getMonth()] + ", " + newMonth.getFullYear());
                createCalendar(newMonth.getMonth(),newMonth.getFullYear(),today);
            }
        });
        $("#right").click(function () {
            var arrForMonth=findDomDate();
            var monthFromDOM=$.inArray(arrForMonth[0],monthNames);
            if(monthFromDOM){
                newMonth=new Date(arrForMonth[1],monthFromDOM,1);
                newMonth.setMonth(newMonth.getMonth()+1);
                $("#month").text(monthNames[newMonth.getMonth()] + ", " + newMonth.getFullYear());
                createCalendar(newMonth.getMonth(),newMonth.getFullYear(),today);
            }
        });
        $("#today").click(function () {
             createCalendar(month,year,today);
        });
        
        function parseDate(s) {
            var b = s.split(/\D/);
            return new Date(b[0], --b[1], b[2]);
        }
        /*constructor for events*/
        function Event(name, date, participants, description) {
            this.name = name;
            this.date = date;
            this.participants = participants || "";
            this.description = description || "";
        }
        $(".shortFormEvent button[name=create]").click(quickAddEvent);
        function quickAddEvent() {
            var flag=true;//if data is valid
            var value=$(".shortFormEvent input[name=eventWithDate]").val();
            /*validate data*/
            if(!!value){
                try{
                var arr=value.split(" ");
                var day=parseInt(arr[0]);
                var m=arr[1].slice(0,-1);
                var month=$.inArray(m, monthNames);
                var str=$("#month").html();
                var arr1=str.split(",");
                var year=parseInt(arr1[1]);
                var time=arr[2].split(":");
                var hour=parseInt(time[0]);
                var mimute=parseInt(time[1].slice(0,-1));
                var date=new Date(year,month,day,hour,mimute);
                
                if(date.getFullYear()!==year||date.getMonth()!==month||date.getUTCDate()!==day||date.getHours()!==hour||date.getMinutes()!==mimute){
                    //invalid
                    flag=false;
                }
                }
                catch(e){
                    flag=false;
                }
            }
            else{
                //invalid 
                flag=false;
            }
            if(flag){
                //$(".shortFormEvent input[name=eventWithDate]").IsValid=true;
                $(".shortFormEvent input[name=eventWithDate]").oninvalid = this.setCustomValidity('');
                var name = "";
                for (i = 3; i < arr.length; i++) {
                    name += arr[i] + " ";
                }
                var event = new Event();
                event.name = name;
                event.date = date;
                events.push(event);
                localStorage.setItem('events', JSON.stringify(events));                     
            }
            else{
                //$(".shortFormEvent input[name=eventWithDate]").IsValid=false;
                $(".shortFormEvent input[name=eventWithDate]").oninvalid=this.setCustomValidity('Please, enter data in right format!');
            }
        }
        function forSubmitForms(nameOfForm){
            var str = "." + nameOfForm + " form";
            $(str).submit(function (e) {
                e.preventDefault();
                var curDate = findDomDate();
                createCalendar($.inArray(curDate[0], monthNames), parseInt(curDate[1]), today);
                $("."+nameOfForm).fadeOut(600);
            });
        }
        forSubmitForms("shortFormEvent");
        forSubmitForms("formForEvent");
        forSubmitForms("formForEditEvent");
        function findEventInArray(date) {
            var c;
            var arrLength=events.length;
            var d;
            for(c=0;c<arrLength;c++){
                d=new Date(events[c].date);
                if(date.getDate() == d.getDate() && date.getMonth() == d.getMonth() && date.getFullYear() == d.getFullYear())
                    return events[c];
            }
        }
        function findEvets() {
                var l = events.length;
                var j;
                if (l != 0) {
                    for (j = 0; j < l; j++) {
                        addToCalendar(events[j]);
                    }
                }
            }
        function readDateFromHiddenElement(elem) {
                var tempDate, str;
                str = elem.find("div").text();
                return new Date(str);
            }
        function addToCalendar(event) {
                var m = new Date(event.date);
                var dateFromElem;
                for (i = 0; i < 42; i++) {
                    dateFromElem = readDateFromHiddenElement($("td").eq(i));
                    if (dateFromElem.getDate() == m.getDate() && dateFromElem.getMonth() == m.getMonth() && dateFromElem.getFullYear() == m.getFullYear()) {
                        $("td").eq(i).addClass("event");
                        var newStr = "<p class='name'>";
                        newStr += event.name + "</p>";
                        if (event.participants)
                            newStr += "<p>" + event.participants + "</p>";
                        $("td").eq(i).append(newStr);
                    }
                }
            }
        function refreshEvent(event) {
            var str=$(".formForEditEvent [name=description]").val();
            var i=$.inArray(event,events);
            if(i!=-1){
                events[i].description = str;
                localStorage.setItem('events', JSON.stringify(events));
            }
        }
        function deleteEvent(event) {
            var i=$.inArray(event,events);
            if(i!=-1){
                events.splice(i,1);
                localStorage.setItem('events', JSON.stringify(events));
            }
        }
        function resetForms() {
           var value = $(".formForEvent input[name=date]").val();
           $('.formForEvent').find('form')[0].reset();
           // var valOfPlaceholder=$(".formForEvent input[name=participant]").attr('data-placeholder');
            //$(".formForEvent input[name=participant]").val(" ");
           // $(".formForEvent input[name=participant]").attr('data-placeholder',valOfPlaceholder);
            //$(".formForEvent input[name=event]").val(" ");
           // $(".formForEvent [name=description]").val(" ")
            $(".formForEvent input[name=date]").val(value);
            //document.getElementsByName('Email')[0].placeholder='new text for email';
            //var placeholder = document.getElementById("demo").getAttribute("placeholder");
        }
        //for search
            $("#search_box").focus(function () {
                var pos = $(this).offset();
                var h = $(this).height();
                var w = $(this).width();
                $(".searchForm").width($("#search_box").width());
                $(".searchForm").css({ left: pos.left, top: pos.top + h + 15 });
                $(".searchForm").fadeIn(600);
                search();
                $(".searchForm li").click(function (e) {
                    var str = $(this).html();
                    var lastLetter=str.indexOf("</b>");
                    var name=str.slice(3,lastLetter);
                    var firstLetter=str.indexOf("<div>")+5;
                    lastLetter=str.indexOf("</div>");
                    var date=str.slice(firstLetter,lastLetter);
                    arrDate=date.split(" ");
                    dateOfEvent=new Date(today.getFullYear(),$.inArray(arrDate[1], monthNames), parseInt(arrDate[0]));
                    var event=findEventInArray(dateOfEvent);
                    createCalendar(dateOfEvent.getMonth(),dateOfEvent.getFullYear(),today);
                })
            });
            $("#search_box").blur(function () {
                $(".searchForm").fadeOut(600);
            });
            function getInfoFromEvents() {
                var i, arrObj=[];
                for (i = 0; i < events.length; i++) {
                    arrObj.push({ name: events[i].name, date: events[i].date });
                }
                return arrObj;
            }
            function search() {
                var list = getInfoFromEvents();
                var str, i,date;
                $("ul").empty();
                for (i = 0; i < list.length; i++) {
                    date=new Date(list[i].date)
                    str = $("<li></li>").html("<b>" + list[i].name + "</b>" + "<br/>" + "<div>" + date.getDate() +" "+ monthNames[date.getMonth()] + "</div>");
                    $("ul").append(str);
                }
                $('.live-search-list li').each(function () {
                    $(this).attr('data-search-term', $(this).text().toLowerCase());
                });
                $('#search_box').on('keyup', function () {
                    var searchTerm = $(this).val().toLowerCase();
                    $('.live-search-list li').each(function () {
                        if ($(this).filter('[data-search-term *= ' + searchTerm + ']').length > 0 || searchTerm.length < 1) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                });
            }
            $( window ).resize(function() {
                var arrForMonth=findDomDate();
                var monthFromDOM=$.inArray(arrForMonth[0],monthNames);
                if(monthFromDOM){
                createCalendar(monthFromDOM,arrForMonth[1],today);
            }
            });
    });

})();