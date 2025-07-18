var buttonClicked = ""
var allowHighlighting = false;
var highLightColor =""
const highLightColors = [
    "bg-red-600",
    "bg-blue-600",
    "bg-green-600",
    "bg-yellow-600",
    "bg-pink-600",
    "bg-indigo-600",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-lime-600",
    "bg-emerald-600",
    "bg-orange-600",
    "bg-amber-600",
    "bg-fuchsia-600",
    "bg-rose-600",
    "bg-violet-600",
    "bg-sky-600",
]

var highlightedVerses ={
    "v43003016": "bg-red-600",
       "v43003019": "bg-red-600",
         "v43003021": "bg-red-600",
};

var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    // Change the icons inside the button based on previous settings
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        themeToggleLightIcon.classList.remove('hidden');
        document.getElementById('theme-toggle').checked = true;
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
        document.getElementById('theme-toggle').checked = false;
    }
    
    var themeToggleBtn = document.getElementById('theme-toggle');
    
    themeToggleBtn.addEventListener('click', function() {
    
        // toggle icons inside button
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');
    
        // if set via local storage previously
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
    
        // if NOT set via local storage previously
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
        
    });

    const searchHistory = new Set();

    function addHistoryItem(verse) {
        document.getElementById("history").innerHTML += "<div class=\"history-item\">" + 
 "<button class=\"cursor-pointer underline\" onclick=\"useHistory('" + verse + "')\">"
  + verse + "</button>"  + "</div>"; }


    function createHistory() {
        document.getElementById("history").innerHTML = "";
        searchHistory.forEach(addHistoryItem);
    }
    function useHistory(verse) {
        document.getElementById("search").value = verse;
        verseLookup();
    }

    function clearSearchHistory() {
      document.getElementById('history').innerHTML = '';
      searchHistory.clear();
    }

    async function verseLookup() {
        var verse = document.getElementById("search").value;
        var headings = document.getElementById("headings").checked;
        var extras = document.getElementById("extras").checked;
        var numbers = document.getElementById("numbers").checked;

        if (verse.match(/(\d+)/) || verse === "") {
        var url = "/api?verse=" + verse + "&headings=" + headings + "&extras=" + extras + "&numbers=" + numbers; 
        fetch(url)
           .then(response => response.json())
            .then(data => {
                document.getElementById("verse").innerHTML = data.passages.join('');
               searchHistory.add(data.query);
               createHistory();
               wrapText();
            });
           
        } else if (verse.match(/romans road/i) || verse.match(/roman's road/i)) {
                document.getElementById("verse").innerHTML = "<h1>Romans Road to Salvation</h1>";
                verses = [
                    "Romans 3:23",
                     "Romans 3:12",
                      "Romans 5:10",
                       "Romans 6:23",
                        "Romans 5:8",
                         "Romans 10:9-10",
                          "Romans 10:13",
                           "Romans 10:17",
                        ];
                        let collector = "";
                        let count = verses.length;
                        verses.forEach(verse => {
                        
                       
                var url = "/api?verse=" + verse + "&headings=" + headings + "&extras=" + extras + "&numbers=" + numbers; 
                fetch(url)
                   .then(response => response.json())
                    .then(data => {
                      collector += data.passages.join("");
                     //  searchHistory.add(data.query);
                     //  createHistory();
                      // wrapText();
                      if (--count === 0) {
                        document.getElementById("verse").innerHTML = collector;
                      }
                    });
                });
        } else {
            var url = "/search?search=" + verse;
            fetch(url)
            .then(response => response.json())
            .then(data => {
           let html = '<ul>';
           data.results.forEach(obj => {
             html += "<li><button class=\"cursor-pointer underline\" onclick=\"useHistory('" + obj.reference + "')\">"+ obj.reference + "</button>"
            html += ` -- ${obj.content}</li>`;
           });
           html += '</ul>';
           document.getElementById("verse").innerHTML = html;
           searchHistory.add(verse);
           createHistory();
            });
        }
        window.scrollTo(0,0);
    }



    
    function wrapText() {
        const anchors = document.querySelectorAll("a.va");
        anchors.forEach((anchor) => {
            const wrapper = document.createElement("span");
            wrapper.classList.add("verse");
            const verseId = anchor.getAttribute("rel"); // e.g., "v40001007"
            if (verseId) {
                wrapper.setAttribute("data-verse", verseId);
            }

         
    
            let current = anchor;
            const parent = anchor.parentNode;
    
            // Add the anchor itself to the wrapper
            wrapper.appendChild(current.cloneNode(true));
            let next = current.nextSibling;
    
            // Wrap content until the next anchor
            while (next && !(next.nodeType === 1 &&
                (next.matches("a.va")
                    || next.classList.contains("verse-num")
                    || next.tagName.toLowerCase() === "p"))) {
                const sibling = next.nextSibling;
                wrapper.appendChild(next);
                next = sibling;
            }
            // Insert the wrapper before the anchor, then remove the original
            parent.insertBefore(wrapper, anchor);
            anchor.remove();
    
            // Add click-to-highlight functionality
            wrapper.addEventListener("click", () => {
                highlightWrapper(wrapper, highLightColor);
                var verseId = wrapper.getAttribute("data-verse");
                if (highlightedVerses[verseId] && highlightedVerses[verseId] === highLightColor) {
                    delete highlightedVerses[verseId];
                } else {
                    highlightedVerses[verseId] = highLightColor;
                }
            });
               //Check if the verse is in the highlightedVerses array
           if (highlightedVerses[verseId]) {
            console.log("highlighting verse:", verseId);
            allowHighlighting = true;
            highlightWrapper(wrapper, highlightedVerses[verseId]);
            allowHighlighting = false;
           }
        });
    }


    function highlightWrapper(wrapper, highLightColor) { 
               const children = wrapper.children;

        if (allowHighlighting) {
            if (hasClass(wrapper, highLightColor)) {
                removeClass(wrapper, highLightColor);
               for (child of children) {
                    if(hasClass(child, "woc-highlighted")){
                        removeClass(child, "woc-highlighted");
                        addClass(child, "woc");
                    }
                }
            } else {
                highLightColors.forEach((color) => {
                    removeClass(wrapper, color);
                });
                addClass(wrapper, highLightColor);
                for (child of children) {
                    if(hasClass(child, "woc")){
                        removeClass(child, "woc");
                        addClass(child, "woc-highlighted");
                   }
                }
           }
        }
    }


    function HighlightButtonClicked(me) {
        console.log(me.id);
        var buttons = document.querySelectorAll(".highlight-button");
        buttons.forEach((button) => {
            removeClass(button, "dark:border-violet-950");
            removeClass(button, "border-neutral-900");
            addClass(button, "border-transparent");
        });
        if (allowHighlighting && me.id === buttonClicked) {
            allowHighlighting = false;
        } else {
            removeClass(me, "border-transparent");
            addClass(me, "dark:border-violet-950");
            addClass(me, "border-neutral-900");
            buttonClicked = me.id;
            allowHighlighting = true;
            highLightColor = "bg-" + me.id.split("-")[1] + "-600";
            console.log(highLightColor);
        }

    }
    

    var inputField = document.getElementById('search');
    inputField.addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            verseLookup();
        }
    });

    ["headings", "extras", "numbers"].forEach(function(id) {
        document.getElementById(id).addEventListener("change", verseLookup);
    });
    
    function hasClass(ele, cls) {
        return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
    
    function addClass(ele, cls) {
        if (!hasClass(ele, cls)) ele.className += " " + cls;
    }
    
    function removeClass(ele, cls) {
        if (hasClass(ele, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            ele.className = ele.className.replace(reg, ' ');
        }
    }
    
    //Add event from js the keep the marup clean
    function init() {
        document.getElementById("open-menu").addEventListener("click", toggleMenu);
        document.getElementById("body-overlay").addEventListener("click", toggleMenu);
    }
    
    //The actual fuction
    function toggleMenu() {
        var ele = document.getElementsByTagName('body')[0];
        if (!hasClass(ele, "menu-open")) {
            addClass(ele, "menu-open");
        } else {
            removeClass(ele, "menu-open");
        }
    }
    
    //Prevent the function to run before the document is loaded
    document.addEventListener('readystatechange', function() {
        if (document.readyState === "complete") {
            init();
        }
    });