$ = document.querySelector;

var initWithoutImages = function() {
    createScrollHandlers();
};

var createScrollHandlers = function() {
    var BUFFER = 200;

    var sections = document.querySelectorAll('section');
    var sectionIds = [];
    for (var i = 0; i < sections.length; i++)
        sectionIds.push(sections[i].id.replace('section-', ''));

    var scrollAnimation = function(event) {
        event.preventDefault();
        var sectionName = this.id.replace('menu-item-','');
        var sectionIndex;
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].id.replace('section-','') == sectionName)
                sectionIndex = i;
        }
        setCurrentMenuItem(sectionIndex);
        var anchorEl = document.getElementById(sectionName);
        var bodyEl = document.querySelector('main');
        var scrollY = window.pageYOffset;
        window.scrollY = 0;
        bodyEl.style.marginTop = '0px';
        var destination = Math.max(anchorEl.offsetTop, 0);
        var scrollDelta = scrollY - destination;
        bodyEl.style.transition = 'all .5s ease';
        bodyEl.style.marginTop = scrollDelta + 'px';
        bodyEl.style.overflowY = 'hidden';
        bodyEl.addEventListener('transitionend', function(event) {
            if (event.propertyName == 'margin-top') {
                bodyEl.style.transition = '';
                bodyEl.style.marginTop = '0px';
                window.scrollTo(0, destination);
            }
        });
    };

    var menuItems = [];
    for (var i = 0; i < sectionIds.length; i++) {
        var el = document.getElementById('menu-item-' + sectionIds[i]);
        el.addEventListener('click', scrollAnimation);
        menuItems.push(el);
    }

    var previousSection = -1;
    var setCurrentSection = function(index) {
        if (previousSection >= 0) {
            sections[previousSection].className = '';
        }
        sections[index].className = 'current-section';
        previousSection = index;
    };

    var previousMenuItem = -1;
    var setCurrentMenuItem = function(index) {
        if (previousMenuItem >= 0) {
            history.pushState({}, '',
                '#' + sections[index].id.replace('section-', ''));
            if (index == previousMenuItem) return;
            menuItems[previousMenuItem].className = '';
        }
        menuItems[index].className = 'current-item';
        previousMenuItem = index;
    };

    var nextBreakpoint, prevBreakpoint;
    var updateBreakpoints = function(index) {
        if (index < sections.length - 1)
            nextBreakpoint = sections[index + 1].offsetTop - BUFFER;
        else
            nextBreakpoint = Number.POSITIVE_INFINITY
        if (index > 0)
            prevBreakpoint = sections[index].offsetTop - BUFFER;
        else
            prevBreakpoint = Number.NEGATIVE_INFINITY;
    }

    window.addEventListener('scroll', function() {
        var scroll = window.pageYOffset;;
        if (scroll >= nextBreakpoint || scroll <= prevBreakpoint) {
            var sectionsScrolled = 0;
            for (var i = 0; i < sections.length; i++)
                if (sections[i].offsetTop - BUFFER < scroll)
                    sectionsScrolled++;
            setCurrentMenuItem(sectionsScrolled - 1);
            setCurrentSection(sectionsScrolled - 1);
            updateBreakpoints(sectionsScrolled - 1);
        }
    });

    setCurrentMenuItem(0);
    setCurrentSection(0);
    updateBreakpoints(0);
};

var initWithImages = function() {
    var sections = document.querySelector('main').children;
    var finalSection = sections[sections.length - 2];
    var bottomBuffer = window.innerHeight - finalSection.clientHeight;
    if (bottomBuffer > 0) {
        document.querySelector('#bottom-scroll-list-buffer').style.height =
            bottomBuffer + 'px';
    }
};

window.addEventListener('DOMContentLoaded', initWithoutImages, false);
window.addEventListener('load', initWithImages, false);
