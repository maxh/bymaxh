var fixedNavHeight;

var initWithoutImages = function() {
  createScrollHandlers();
};

var createScrollHandlers = function() {
  var BUFFER = 200;

  var sections = document.querySelectorAll('section');
  var sectionIds = [];
  for (var i = 0; i < sections.length; i++) {
    sectionIds.push(sections[i].id.replace('section-', ''));
  }

  var scrollAnimation = function(event) {
    event.preventDefault();
    var sectionName = this.id.replace('menu-item-','');
    var sectionIndex;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].id.replace('section-','') == sectionName) {
        sectionIndex = i;
      }
    }
    setCurrentMenuItem(sectionIndex);  // Change link before animating.

    var anchorEl = document.getElementById(sectionName);
    var mainEl = document.querySelector('main');
    var scrollY = window.pageYOffset;
    window.scrollY = 0;
    mainEl.style.marginTop = 0 + 'px';
    var destination = Math.max(anchorEl.offsetTop - fixedNavHeight, 0);
    var scrollDelta = scrollY - destination;
    mainEl.style.transition = 'all .5s ease';
    mainEl.style.marginTop = scrollDelta + 'px';
    mainEl.style.overflowY = 'hidden';
    mainEl.addEventListener('transitionend', function(event) {
      if (event.propertyName == 'margin-top') {
        mainEl.style.transition = '';
        mainEl.style.marginTop = '0px';
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
      history.pushState({}, '', '#' + sectionIds[index]);
      if (index == previousMenuItem) return;
      menuItems[previousMenuItem].className = '';
    }
    menuItems[index].className = 'current-item';
    previousMenuItem = index;
  };

  var nextBreakpoint, prevBreakpoint;
  var updateBreakpoints = function(index) {
    nextBreakpoint = index < sections.length - 1 ?
        sections[index + 1].offsetTop - BUFFER :
        Number.POSITIVE_INFINITY
    prevBreakpoint = index > 0 ?
        sections[index].offsetTop - BUFFER :
        prevBreakpoint = Number.NEGATIVE_INFINITY;
  }

  window.addEventListener('scroll', function() {
    var scroll = window.pageYOffset;;
    if (scroll >= nextBreakpoint || scroll <= prevBreakpoint) {
      var sectionsScrolled = 0;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop - BUFFER < scroll) {
          sectionsScrolled++;
        }
      }
      sectionsScrolled--;
      setCurrentMenuItem(sectionsScrolled);
      setCurrentSection(sectionsScrolled);
      updateBreakpoints(sectionsScrolled);
    }
  });

  setCurrentMenuItem(0);
  setCurrentSection(0);
  updateBreakpoints(0);
};

var initWithImages = function() {
  fixedNavHeight = 0;
  var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  if (screenWidth < 600) {
    fixedNavHeight = document.querySelector('nav').offsetHeight;
  }
  document.querySelector('main').style.paddingTop = fixedNavHeight + 'px';
  var sections = document.querySelector('main').children;
  var finalSection = sections[sections.length - 2];
  var bottomBuffer = window.innerHeight - finalSection.clientHeight;
  if (bottomBuffer > 0) {
    var bottomBufferEl = document.querySelector('#bottom-scroll-list-buffer');
    bottomBufferEl.style.height = bottomBuffer + 'px';
  }
};

window.addEventListener('DOMContentLoaded', initWithoutImages, false);
window.addEventListener('load', initWithImages, false);