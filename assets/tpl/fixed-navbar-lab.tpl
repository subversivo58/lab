<!-- FIXED NAVBAR -->
<nav id="navbar-fixed" class="navbar navbar-expand-md navbar-light fixed-top py-1 bg-white anchor-link" role="navigation">

    <!-- DESKTOP LOGO -->
    <a class="navbar-brand d-none d-md-flex" href="./">
        <picture>
            <img alt="Brand"
                 src="./assets/media/image/1x1.gif"
                 data-src="./assets/media/image/logos/site-logo-avatar@500x100.png"
                 data-lazy-target
                 width="120px"
                 height="30px"
                 class="adjust-middle cp">
        </picture>
    </a>

    <!-- MOBILE LOGO -->
    <a class="navbar-brand d-md-none" href="./">
        <picture>
            <img alt="Brand"
                 src="./assets/media/image/1x1.gif"
                 data-src="./assets/media/image/logos/site-logo-icon@150x150.webp"
                 data-lazy-target
                 width="30px"
                 height="30px"
                 class="adjust-middle cp">
        </picture>
    </a>

    <!-- NAVIGATION LINKS -->
    <div id="navbarNavAltMarkup"
         class="d-flex align-items-center flex-grow-1">

        <ul class="navbar-nav flex-row mr-auto">

            <li class="nav-item">
                <a href="./blog.html"
                   data-i18n-html="navbar.blog"
                   class="i18n nav-link contrast tc"></a>
            </li>

            <li class="nav-item">
                <a href="./about.html"
                   data-i18n-html="navbar.about"
                   class="i18n nav-link contrast tc"></a>
            </li>

            <li class="nav-item nav-item-lab">
                <a href="./lab/"
                   data-i18n-html="navbar.lab"
                   class="i18n nav-link contrast tc"></a>
            </li>

            <li class="nav-item">
                <a href="./dpo.html"
                   data-i18n-html="navbar.dpo"
                   class="i18n nav-link contrast tc"></a>
            </li>
           
            <li class="nav-item nav-item-donations">
                <a href="./donations.html"
                   data-i18n-html="navbar.donations"
                   class="i18n nav-link contrast tc"></a>
            </li>

            <li class="nav-item nav-item-policies">
                <a href="./policy.html"
                   data-i18n-html="navbar.policies"
                   class="i18n nav-link contrast tc"></a>
            </li>

        </ul>

        <!-- MOBILE DRAWER AND SIGN IN -->
        <div class="d-flex align-items-center ml-auto d-md-none">

            <picture id="drawer-menu-2"
                     class="navbar-brand py-0">
                <img alt="Brand"
                     src="./assets/media/image/1x1.gif"
                     data-src="./assets/media/image/icons/animated-cube.webp"
                     data-lazy-target
                     width="26px"
                     height="26px"
                     class="cp">
            </picture>

            <a class="i18n btn btn-sm btn-outline-none border-def contrast rounded-0 mt-0 cp d-none"
               href="#"
               data-i18n-html="navbar.signin"></a>

        </div>

        <!-- DESKTOP DRAWER AND SIGN IN -->
        <ul class="navbar-nav flex-row d-none d-md-flex">

            <li class="nav-item">
                <picture id="drawer-menu-1"
                         class="navbar-brand py-0">
                    <img alt="Brand"
                         src="./assets/media/image/1x1.gif"
                         data-src="./assets/media/image/icons/animated-cube.webp"
                         data-lazy-target
                         width="26px"
                         height="26px"
                         class="cp">
                </picture>
            </li>

            <li class="nav-item">
                <a class="i18n btn btn-sm btn-outline-none border-def contrast rounded-0 mt-0 cp d-none"
                   href="#"
                   data-i18n-html="navbar.signin"
                   disabled></a>
            </li>

        </ul>

    </div>

</nav>