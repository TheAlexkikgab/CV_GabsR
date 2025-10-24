// ========================================
// KIKGAB-OS GAMING SYSTEM - JavaScript
// Designed by GabsR
// ========================================

"use strict";

$(document).ready(function() {
    
    // ========== BOOT SCREEN ==========
    setTimeout(function() {
        $('#boot-screen').addClass('hidden');
    }, 2500);
    
    // ========== SYSTEM TIME ==========
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        $('#system-time').text(`${hours}:${minutes}:${seconds}`);
    }
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // ========== WINDOW MANAGEMENT ==========
    let activeWindows = ['inicio']; // Only 'inicio' open by default
    const $desktopArea = $('.desktop-area');
    
    // Taskbar item clicks - Toggle windows
    $('.taskbar-item').click(function() {
        const windowName = $(this).data('window');
        const $window = $(`#window-${windowName}`);
    // ========== CONSOLE EASTER EGG ==========
        
        if ($window.hasClass('active')) {
            // Window is open and visible - minimize it
            $window.removeClass('active').addClass('minimized');
            $(this).removeClass('active').addClass('minimized-indicator');
            activeWindows = activeWindows.filter(w => w !== windowName);
        } else if ($window.hasClass('minimized')) {
            // Window is minimized - restore it
            $window.removeClass('minimized').addClass('active');
            $(this).removeClass('minimized-indicator').addClass('active');
            if (!activeWindows.includes(windowName)) {
                activeWindows.push(windowName);
            }
            
            // Bring to front
            topZIndex++;
            $window.css('z-index', topZIndex);
        } else {
            // Window is closed - open it
            $window.removeClass('floating maximized minimized').css({
                position: '',
                top: '',
                left: '',
                right: '',
                bottom: '',
                width: '',
                height: '',
                transform: '',
                'z-index': ''
            });

            $window.addClass('active');
            $(this).removeClass('minimized-indicator').addClass('active');

            if (!activeWindows.includes(windowName)) {
                activeWindows.push(windowName);
            }
            
            // If opening the first additional window, remove initial-center from inicio
            if (activeWindows.length > 1 && windowName !== 'inicio') {
                $('#window-inicio').removeClass('initial-center');
            }
            
            // Bring to front
            topZIndex++;
            $window.css('z-index', topZIndex);
        }
    });
    
    // Window control buttons
    $('.win-btn.close').click(function(e) {
        e.stopPropagation();
        const $window = $(this).closest('.window-container');
        const windowName = $window.attr('id').replace('window-', '');
        
        $window.removeClass('active floating maximized minimized').css({
            position: '',
            top: '',
            left: '',
            right: '',
            bottom: '',
            width: '',
            height: '',
            transform: '',
            'z-index': ''
        }).removeData('prev-state');
        
        // Deactivate taskbar item
        $(`.taskbar-item[data-window="${windowName}"]`).removeClass('active minimized-indicator');
        
        // Remove from active windows array
        activeWindows = activeWindows.filter(w => w !== windowName);
    });
    
    $('.win-btn.minimize').click(function(e) {
        e.stopPropagation();
        const $window = $(this).closest('.window-container');
        const windowName = $window.attr('id').replace('window-', '');
        
        $window.removeClass('active').addClass('minimized');
        
        // Sync taskbar state
        $(`.taskbar-item[data-window="${windowName}"]`).removeClass('active').addClass('minimized-indicator');
        activeWindows = activeWindows.filter(w => w !== windowName);
    });
    
    $('.win-btn.maximize').click(function(e) {
        e.stopPropagation();
        const $window = $(this).closest('.window-container');
        
        if ($window.hasClass('maximized')) {
            const prevState = $window.data('prev-state') || {};
            $window.removeClass('maximized');
            $window.css({
                width: prevState.width || '',
                height: prevState.height || '',
                top: prevState.top || '',
                left: prevState.left || '',
                right: prevState.right || '',
                bottom: prevState.bottom || '',
                transform: prevState.transform || '',
                position: prevState.position || '',
                'z-index': prevState.zIndex || ''
            });

            if (prevState.floating) {
                $window.addClass('floating');
            } else {
                $window.removeClass('floating');
            }

            $window.removeData('prev-state');
        } else {
            $window.data('prev-state', {
                width: $window.css('width'),
                height: $window.css('height'),
                top: $window.css('top'),
                left: $window.css('left'),
                right: $window.css('right'),
                bottom: $window.css('bottom'),
                transform: $window.css('transform'),
                position: $window.css('position'),
                zIndex: $window.css('z-index'),
                floating: $window.hasClass('floating')
            });

            $window.addClass('maximized').removeClass('floating minimized');
            $window.css({
                position: 'fixed',
                top: '1.5rem',
                left: '1.5rem',
                right: '1.5rem',
                bottom: '1.5rem',
                width: 'auto',
                height: 'auto',
                transform: 'none'
            });

            topZIndex++;
            $window.css('z-index', topZIndex);
        }
    });
    
    // ========== DRAGGABLE WINDOWS ==========
    let isDragging = false;
    let currentWindow = null;
    let offsetX = 0;
    let offsetY = 0;
    let topZIndex = 10;

    $('.window-header').on('mousedown', function(e) {
        if ($(e.target).hasClass('win-btn')) return;

        e.preventDefault(); // Prevent text selection and other default behaviors

        currentWindow = $(this).closest('.window-container');
        if (currentWindow.hasClass('maximized')) return;

        isDragging = true;

        // Bring window to front immediately
        topZIndex++;
        currentWindow.css('z-index', topZIndex);

        const desktopRect = $desktopArea[0].getBoundingClientRect();
        const rect = currentWindow[0].getBoundingClientRect();

        if (!currentWindow.hasClass('floating')) {
            currentWindow.addClass('floating');
            currentWindow.css({
                position: 'fixed',
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                right: '',
                bottom: '',
                transform: 'none'
            });
        }

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        currentWindow.css({
            cursor: 'grabbing',
            'user-select': 'none',
            transition: 'none'
        });

        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
    });

    $(document).on('mousemove', function(e) {
        if (!isDragging || !currentWindow) return;

        e.preventDefault();

        const desktopRect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        // Constrain to viewport bounds
        const maxX = Math.max(0, desktopRect.width - currentWindow.outerWidth());
        const maxY = Math.max(0, desktopRect.height - currentWindow.outerHeight());

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        currentWindow.css({
            left: `${constrainedX}px`,
            top: `${constrainedY}px`,
            transform: 'none'
        });
    });

    $(document).on('mouseup', function() {
        if (currentWindow) {
            currentWindow.css({
                cursor: 'default',
                'user-select': '',
                transition: ''
            });
        }

        // Re-enable text selection
        document.body.style.userSelect = '';

        isDragging = false;
        currentWindow = null;
    });
    
    // ========== RESIZE WINDOWS ==========
    let isResizing = false;
    let resizeWindow = null;
    let startWidth = 0;
    let startHeight = 0;
    let startX = 0;
    let startY = 0;

    $('.resize-handle').on('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();

        resizeWindow = $(this).closest('.window-container');
        if (resizeWindow.hasClass('maximized')) return;

        isResizing = true;

        startX = e.clientX;
        startY = e.clientY;
        startWidth = resizeWindow.outerWidth();
        startHeight = resizeWindow.outerHeight();

        resizeWindow.css({
            cursor: 'nw-resize',
            'user-select': 'none',
            transition: 'none'
        });

        document.body.style.userSelect = 'none';
    });

    $(document).on('mousemove', function(e) {
        if (!isResizing || !resizeWindow) return;

        e.preventDefault();

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newWidth = Math.max(300, startWidth + deltaX); // Min width 300px
        const newHeight = Math.max(200, startHeight + deltaY); // Min height 200px

        resizeWindow.css({
            width: `${newWidth}px`,
            height: `${newHeight}px`
        });
    });

    $(document).on('mouseup', function() {
        if (resizeWindow) {
            resizeWindow.css({
                cursor: 'default',
                'user-select': '',
                transition: ''
            });
        }

        document.body.style.userSelect = '';

        isResizing = false;
        resizeWindow = null;
    });
    
    // ========== THEME TOGGLE ==========
    $('#theme-toggle').click(function() {
        const icon = $(this);
        if (icon.text() === '🌙') {
            icon.text('☀️');
            // Light mode logic (optional)
            $('body').addClass('light-mode');
        } else {
            icon.text('🌙');
            $('body').removeClass('light-mode');
        }
    });
    
    // ========== TYPING EFFECT ==========
    const typingText = "Especialista en Automatización & Backend";
    const typingElement = $('.typing-effect');
    let charIndex = 0;
    
    function typeText() {
        if (charIndex < typingText.length) {
            typingElement.text(typingText.substring(0, charIndex + 1));
            charIndex++;
            setTimeout(typeText, 100);
        }
    }
    $(document).keydown(function(e) {
        // Alt + 1-6 to toggle windows
        if (e.altKey) {
            const keyMap = {
                49: 'inicio',    // Alt + 1
                50: 'sobre-mi',  // Alt + 2
                51: 'skills',    // Alt + 3
                52: 'experience',// Alt + 4
                53: 'contact',   // Alt + 5
                54: 'educacion'  // Alt + 6
            };
            
            const windowName = keyMap[e.keyCode];
            if (windowName) {
                e.preventDefault();
                $(`.taskbar-item[data-window="${windowName}"]`).click();
            }
        }
        
        // Ctrl + W to close focused window (last clicked)
        if (e.ctrlKey && e.keyCode === 87) {
            e.preventDefault();
            const $topWindow = $('.window-container.active').last();
            if ($topWindow.length) {
                $topWindow.find('.win-btn.close').click();
            }
        }
    });
    
    // ========== RESPONSIVE: SHOW ALL WINDOWS ON MOBILE ==========
    function checkMobile() {
        if ($(window).width() <= 768) {
            // On mobile, stack all windows vertically (bento becomes vertical layout)
            $('.window-container').each(function(index) {
                $(this).removeClass('initial-center').css({
                    'position': 'relative',
                    'top': 'auto',
                    'left': 'auto',
                    'right': 'auto',
                    'transform': 'none',
                    'width': 'calc(100% - 20px)',
                    'height': 'auto',
                    'margin': '10px auto'
                });
            });
            $('.desktop-area').css('overflow-y', 'auto');
            // Taskbar center remains visible on mobile
        } else {
            // On desktop, reset to bento grid positions
            $('.window-container').css({
                'position': '',
                'top': '',
                'left': '',
                'right': '',
                'transform': '',
                'width': '',
                'height': '',
                'margin': ''
            });
            $('.desktop-area').css('overflow-y', '');
        }
    }
    
    checkMobile();
    $(window).resize(checkMobile);
    
    // ========== CONSOLE EASTER EGG ==========
    console.log('%c🎮 KIKGAB-OS GAMING SYSTEM - Bento Grid Edition', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');
    console.log('%cDeveloped by THEALEXKIKGAB (Gabriel Rodríguez)', 'color: #a78bfa; font-size: 12px;');
    console.log('%c📌 Features:', 'color: #94a3b8; font-size: 10px;');
    console.log('%c  • Bento grid layout by default', 'color: #94a3b8; font-size: 10px;');
    console.log('%c  • Drag & drop windows anywhere', 'color: #94a3b8; font-size: 10px;');
    console.log('%c  • Alt+1 to Alt+5: Toggle windows', 'color: #94a3b8; font-size: 10px;');
    console.log('%c  • Ctrl+W: Close focused window', 'color: #94a3b8; font-size: 10px;');
    console.log('%c  • All windows open simultaneously!', 'color: #8b5cf6; font-size: 10px;');
    
});
