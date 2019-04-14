var modalCloseDelay = 200;

angular.module('splatApp').controller('ModalCtrl', function($scope, $rootScope, $uibModal, $log, $timeout) {
  $scope.animationsEnabled = true;

  var templates = {
    weaponPickerNew : `
    <div class="row">
    <div class="col-md-12">
    <div class="card neonstripes" id="dialog">
    <div class="row cardheader">
    Weapon Picker
    </div>
    <div class="row">
    <div class="col-md-4">
    <div class="row">
    <div class="col-md-12 col-sm-6">
    <img id="weapon-picker-selected" fallback-img ng-src="{{selectedWeapon.image}}" />
    </div>
    <div class="col-md-12 col-sm-6">
    <div class="selected-label">
    <span>{{selectedWeapon.localizedName['en_US']}}</span></div>
    <div class="col-md-12">
    <div class="row">
    <div class="col-xs-4 nopadding">
    <img ng-src="{{getSubIcon(selectedWeapon.sub)}}" uib-tooltip="{{getSubByName(selectedWeapon.sub).localizedName['en_US']}}" tooltip-append-to-body="true"  class="subspeicon" />
    </div>
    <div class="col-xs-8 nopadding">
    <div class="subspe-bubble">
    <img ng-src="{{getSpecialIcon(selectedWeapon.special)}}" uib-tooltip="{{getSpecialByName(selectedWeapon.special).localizedName['en_US']}}" tooltip-append-to-body="true" class="subspeicon" />
    {{selectedWeapon.specialCost}}p
    </div>
    </div>
    </div>
    </div>
    <div class="col-md-12" id="minibar-container">
    <div class="row" ng-repeat="(stat,value) in selectedWeapon.stats">
    <div class="col-sm-6 col-xs-3 nopadding minibar-label readable">
    {{stat}}
    </div>
    <div class="col-sm-6 col-xs-9 nopadding">
    <uib-progressbar max="100" type="pink" value="value" class="statbar mini" />
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    <div class="col-md-8 picker-right">
    <div class="row">
    <div class="col-md-12">
    <select class="form-control dropdown-toggle" data-ng-options="x.localizedName['en_US' || 'en_US'] for x in weaponSets" data-ng-model="selectedSet" ng-change="switchSet()"></select>
    <input id="weaponSearchFilterText" ng-model="weaponSearchFilterText" class="form-control form-control-sm" type="text" placeholder="Search...">
    </div>
    </div>
    <div class="col-md-12">
    <div class="row">
    <div class="picker">
    <div class="gear-wrapper" ng-repeat="weapon in availableWeapons() | filter:weaponSearchFilter">
    <img class="gear-icon" ng-src="{{::weapon.image}}" ng-click="selectWeapon(weapon)" uib-tooltip="{{::weapon.localizedName['en_US']}}" tooltip-append-to-body="true"/>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    <div class="row buttons">
    <div class="col-xs-6 col-md-4 col-md-offset-2">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="cancel()"><span>Cancel</span></button>
    </div>
    <div class="col-xs-6 col-md-4">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="ok()"><span>OK</span></button>
    </div>
    </div>
    </div>
    </div>
    `,
    // TODO / FIXME - handle grizzco more elegantly
    gearPicker : `<div class="row">
    <div class="col-md-12">
    <div class="card {{::background}}" id="dialog">
    <div class="row cardheader">
    Gear Picker
    </div>
    <div class="row">
    <div class="col-md-4">
    <div class="row">
    <div class="col-md-12 col-sm-6">
    <img fallback-img ng-src="{{selectedGear.image}}" />
    </div>
    <div class="col-md-12 col-sm-6">
    <div class="selected-label" class="selected-label">
    <span>{{selectedGear.localizedName['en_US']}}</span></div>
    <div id="gearpicker-stats">
    <span ng-if="selectedGear.main != undefined"><img ng-src="{{getSkillByName(selectedGear.main).image}}"/>  {{getSkillByName(selectedGear.main).localizedName['en_US']}}</span>
    <span ng-if="selectedGear.main == undefined"><img ng-src="../common/assets/img/skills/Unknown.png"/>  ???</span>
    <br>
    <img ng-src="{{brands[selectedGear.brand].image}}"/> {{brands[selectedGear.brand].localizedName['en_US']}}<br>
    <div>
    <span ng-if="brands[selectedGear.brand].common">
    <span class="fa green fa-arrow-up"></span><img ng-src="{{getSkillByName(brands[selectedGear.brand].common).image}}"/>
    <span class="fa red fa-arrow-down"></span><img ng-src="{{getSkillByName(brands[selectedGear.brand].uncommon).image}}"/>
    </span>
    </div>
    </div>
    </div>
    </div>
    </div>
    <div class="col-md-8 picker-right">
    <input id="gearSearchFilterText" ng-model="gearSearchFilterText" class="form-control form-control-sm" type="text" placeholder="Search...">
    <div class="picker">
    <div ng-click="selectGear(item)" ng-repeat="item in filtered.primary | filter:gearSearchFilter track by item.id" uib-tooltip="{{::item.localizedName['en_US']}}" tooltip-append-to-body="true" class="gear-wrapper">
    <img class="gear-icon" ng-src="{{item.image}}"/>
    <span class="brand-icon">
    <img ng-src="{{::brands[item.brand].image}}"/>
    </span>
    <span class="main-icon">
    <img ng-if="item.main != undefined" ng-src="{{::getSkillByName(item.main).image}}"/>
    </span>
    </div><!--
    --><div ng-click="selectGear(item)" ng-repeat="item in filtered.secondary | filter:gearSearchFilter track by item.id" uib-tooltip="{{::item.localizedName['en_US']}}" tooltip-append-to-body="true" class="gear-wrapper">
    <img class="gear-icon" ng-src="{{::item.image}}"/>
    <span class="brand-icon">
    <img ng-src="{{::brands[item.brand].image}}"/>
    </span>
    <span class="main-icon">
    <img ng-if="item.main != undefined" ng-src="{{::getSkillByName(item.main).image}}"/>
    </span>
    <span class="annie">
    <img ng-if="item.brand != 'Grizzco'?item.name != 'Splatfest Tee'?true:false:false" src="../common/assets/img/misc/annie.png" tooltip-append-to-body="true" tooltip-placement="bottom" uib-tooltip="Non-standard. Only on SplatNet"/>
    </span>
    </div><!--
    --><div ng-repeat="item in filtered.notEligible | filter:gearSearchFilter track by item.id" class="gear-wrapper">
    <img class="gear-icon" ng-src="{{::item.image}}"/>
    <span class="brand-icon">
    <img ng-src="{{::brands[item.brand].image}}"/>
    </span>
    <span class="main-icon">
    <img ng-if="item.main != undefined" ng-src="{{::getSkillByName(item.main).image}}"/>
    </span>
    <span class="not-possible" uib-tooltip="Not possible with selected main" tooltip-append-to-body="true">
    <span class="fa fa-5x fa-ban " ng-if="!isPossibleMain(loadout.clothes.equipped,loadout.clothes.main.name)"></span>
    </span>
    </div>

    </div>
    </div>
    </div>
    <div class="row buttons">
    <div class="col-xs-6 col-md-4 col-md-offset-2">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="cancel()"><span>Cancel</span></button>
    </div>
    <div class="col-xs-6 col-md-4">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="ok()"><span>OK</span></button>
    </div>
    </div>
    </div>
    </div>`,
    //TODO: split this into its own file
    whatsNew: `<div class="row">
    <div class="col-md-12">
    <div class="card basic purplestripes" id="dialog">
    <div class="row cardheader">
    What's New?
    </div>
    <div class="row basic-content">
    <div id="changelog"</div>
    <h4>Version 2.0.0 BETA</h4>
    <ul>
      <li>This is a fork of the original Loadout.ink code base being updated by <a href="https://twitter.com/Selicia2" target="_blank">Selicia</a>. Please consult the Trello Board for progress and status updates.</li>
      <li>Github Repo: <a href="https://github.com/selicia/splat2-calc" target="_blank">https://github.com/selicia/splat2-calc</a>.
      <li>Trello Board: <a href="https://trello.com/b/CjN9IRzJ/loadoutink" target="_blank">https://trello.com/b/CjN9IRzJ/loadoutink</a>.
    </ul>
    <h4>Version 1.2.0</h4>
    <ul>
    <li>Run Speed (Firing) and Ink Consumption (Main) values for most weapons are now up to date for game version 2.3.3.</li>
    <ul>
    <li>Many weapons that were missing these values, such as Hydra Splatling, now have them.</li>
    </ul>
    <li>loadout.ink is now available in Italian and Cantonese Chinese. Please report localization issues on <a href="https://github.com/DeviPotato/splat2-calc/" target="_blank">GitHub</a> or <a href="https://twitter.com/loadout_ink" target="_blank">Twitter.</a></li>
    <ul>
    <li>Italian contributed by <a href="https://twitter.com/marcolago" target="_blank">@marcolago</a>.</li>
    <li>Cantonese Chinese contributed by <a href="https://twitter.com/sam0737" target="_blank">@sam0307</a>.</li>
    </ul>
    <li>Several minor bugfixes and improvements.</li>
    </ul>
    <h4>Version 1.1.5</h4>
    <ul>
    <li>The look and feel of many aspects of the site has been updated. Contributed by <a href="https://github.com/lah7" target="_blank">Luke Horwell</a>.</li>
    <ul>
    <li>See <a href="https://github.com/DeviPotato/splat2-calc/commit/abebfe05d48595c4df1da95d1d1b759093d3eeb3" target="_blank">this commit</a> for details.</li>
    </ul>
    <li>Added all available gear as of game version 2.3.3.</li>
    <ul>
    <li>Some localizations for Spanish (Mexico) and French (Canada) may be incorrect. Please report these on <a href="https://github.com/DeviPotato/splat2-calc/" target="_blank">GitHub</a> or <a href="https://twitter.com/loadout_ink" target="_blank">Twitter.</a></li>
    </ul>
    <li>Grizzco gear no longer has a default ability.</li>
    </ul>
    <h4>Version 1.1.4</h4>
    <ul>
    <li>Updated for game balance changes through version 2.3.3.</li>
    <li>Added Clash Blaster Neo & Undercover Brella.</li>
    </ul>
    <h4>Version 1.1.3</h4>
    <ul>
    <li>Updated released weapons as of 4/6/18.</li>
    </ul>
    <h4>Version 1.1.2</h4>
    <ul>
    <li>Updated values for balance changes in game version 2.0.0.</li>
    <li>Fixed an incorrect subweapon on Gold Dynamo Roller.</li>
    <li>Added recently released weapons.</li>
    <li>The new gear added in 2.0.0 is coming soon.</li>
    </ul>
    <h4>Version 1.1.1</h4>
    <ul>
    <li>Updated most stats and weapons for game version 1.4.0. Cold-Blooded is still outdated and will be fixed soon.</li>
    <li>Splatfest Tee and Tenta Brella have been added.</li>
    <li>Fixed a visual bug due to missing Run Speed (Firing) and Ink Consumption (Main) for the Bamboozler.</li>
    <li>Data is incomplete for the Tenta Brella and the Bamboozler weapons. Firing speed and ink consumption will be added soon.</li>
    </ul>
    <h4>Version 1.1.0</h4>
    <ul>
    <li>loadout.ink is now available in English, Japanese, Spanish, and French. Translation errors can be reported via GitHub or Twitter.</li>
    </ul>
    <h4>Version 1.0.9</h4>
    <ul>
    <li>Fixed incorrect firing run speed for Sploosh-o-matic.</li>
    <li>Added Sub Power Up scaling for Splash Wall and Toxic Mist.</li>
    </ul>
    <h4>Version 1.0.8</h4>
    <ul>
    <li>Fixed incorrect Special cost for Splat Dualies/Hero Dualies.</li>
    <li>Fixed incorrect firing run speed for Heavy Splatling & variants.</li>
    </ul>
    <h4>Version 1.0.7</h4>
    <ul>
    <li>Fixed Run Speed Up incorrectly increasing the roll speed of rollers.</li>
    </ul>
    <h4>Version 1.0.6</h4>
    <ul>
    <li>Updated Special Charge Up scaling to round instead of floor.</li>
    <li>Updated Baller scaling to go from 400HP to 600HP.</li>
    </ul>
    <h4>Version 1.0.5</h4>
    <ul>
    <li>Updated values for game version 1.3.0. Official patch notes can be found <a href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/27028/p/897" target="_blank">here</a>.</li>
    </ul>
    <h4>Version 1.0.4</h4>
    <ul>
    <li>Updated Respawn Punisher to be more accurate.</li>
    <ul>
    <li>However, the values are EXTREMELY rough estimates due to lack of testing, but are more to give a general idea of the impact RSP has on Special Saver and Quick Respawn.</li>
    </ul>
    <li>Added disclaimer for when stats are known to be inaccurate.</li>
    </ul>
    <h4>Version 1.0.3</h4>
    <ul>
    <li>Some more value fixes.</li>
    <li>Ink Consumption (Main) now shows approximate shots per tank in the tooltip.</li>
    </ul>
    <h4>Version 1.0.2</h4>
    <ul>
    <li>Fixed missing Middle swim speed tier.</li>
    </ul>
    <h4>Version 1.0.1</h4>
    <ul>
    <li>Some mobile improvements and fixes for incorrect values.</li>
    </ul>
    <h4>Version 1.0</h4>
    <ul>
    <li>Initial release.</li>
    <li>Some special/sub scaling is still missing.</li>
    <li>Some values may be slightly inaccurate. Please leave an issue <a href="http://github.com/DeviPotato/splat2-calc/" target="_blank">on GitHub</a> with sources if you have corrections.</li>
    </ul>
    </div>
    <div class="row buttons">
    <div class="col-xs-12">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="ok()"><span>Got it!</span></button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    `,
    // FIXME / LOCALIZE - Credit to Luke Horwell needs localization.
    about: `<div class="row">
    <div class="col-md-12">
    <div class="card purplestripes" id="dialog">
    <div class="row cardheader">
    About
    </div>
    <div class="row basic-content readable" id="about">
    <p>Built primarily with AngularJS 1.6.5 and Bootstrap 3.<br><br> This tool was developed using info and assets datamined by <a href='https://twitter.com/LeanYoshi' target='_blank'>Lean</a>, as well as information provided by several members of the Inkademy and Splatoon Developers servers on Discord. <br><br>Thanks to everyone who gave me help and data!<br><br> Many of the formulas used can be seen on <a href='https://splatoonwiki.org/wiki/User:Heddy/Charts' target='_blank'>Heddy's charts</a> on Inkipedia.<br><br> Any feature suggestions, bug reports, and feedback can be left as issues on the project's <a href='https://github.com/DeviPotato/splat2-calc' target='_blank'>GitHub</a>. <br> You can also reach me on the project's <a href='https://twitter.com/loadout_ink' target='_blank'>twitter</a>.</p>
    <p>
    Splatoon 2 UI Dialog/Buttons by <a href="https://github.com/lah7" target="_blank">Luke Horwell.</a>
    </p>
    <div class="row buttons">
    <div class="col-xs-12">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="ok()"><span>Got it!</span></button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    `,
    update: `<div class="row">
    <div class="col-md-12">
    <div class="card purplestripes" id="dialog">
    <div class="row cardheader">
    There's been an update!
    </div>
    <div class="row basic-content readable" id="update">
    <img src="/common/assets/img/ui/update.jpg" width="100%" height="100%"></img>
    <h2 style="text-align:center;">
    Loadout v`
    +
    $scope.appVersionToString()
    +
    `</h2></div><div class="row buttons">
    <div class="col-xs-12">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="ok()"><span>Got it!</span></button>
    </div>
    </div>`,
    excessiveAP: `<div class="row">
    <div class="col-md-12">
    <div class="card purplestripes" id="dialog">
    <div class="row cardheader">
    Excessive AP Warning
    </div>
    <div class="row basic-content readable" id="about">
    <p>Using too much of one ability has significant diminishing returns. Proceed with caution when using this gear. This message will not display again.</p>
    <div class="row buttons">
    <div class="col-xs-12">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="ok()"><span>Got it!</span></button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`,
    spyke: `<div class="row">
    <div class="col-md-12">
    <div class="card purplestripes" id="dialog">
    <div class="row cardheader">
    Spyke Integration
    </div>
    <div class="row basic-content readable" id="about">
    <p>You are about to be redirected to the Spyke Discord application: http://spyke.h3xmani.ac/</p>
    <div class="row buttons">
    <div class="col-xs-6 col-md-4 col-md-offset-2">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="cancel()"><span>Cancel</span></button>
    </div>
    <div class="col-xs-6 col-md-4">
    <button class="btn" type="button" onclick="animateButton(this)" ng-click="ok()"><span>OK</span></button>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>`
  }

  $scope.openWeaponPicker = function(size) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      template: templates["weaponPickerNew"],
      windowTemplateUrl: 'blankModal.html',
      controller: 'WeaponPickerCtrl',
      size: size,
      resolve: {
        selectedSet: function() {
          return $scope.selectedSet;
        },
        weaponSets: function() {
          return $scope.weaponSets;
        },
        subs: function() {
          return $scope.subs;
        },
        selectedWeapon: function() {
          return $scope.loadout.weapon;
        },
        getSubByName: function() {
          return $scope.getSubByName;
        },
        getSpecialByName: function() {
          return $scope.getSpecialByName;
        }
      }
    });

    modalInstance.result.then(function(results) {
      $scope.$parent.selectedSet=results.set; // ???
      $scope.$parent.loadout.weapon=results.weapon;
    }, function() {
 
    });
  };

  $scope.openChangelog = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      template: templates["whatsNew"],
      windowTemplateUrl: 'blankModal.html',
      controller: 'BasicCtrl'
    });

    modalInstance.result.then(function(results) {

    }, function() {

    });
  };

  $scope.openAbout = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      template: templates["about"],
      windowTemplateUrl: 'blankModal.html',
      controller: 'BasicCtrl'
    });

    modalInstance.result.then(function(results) {

    }, function() {

    });
  };

  $scope.openGearPicker = function(gear, equipped, slot) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      template: templates["gearPicker"],
      windowTemplateUrl: 'blankModal.html',
      controller: 'GearPickerCtrl',
      resolve: {
        slot: function() {
          return eval("$scope.loadout." + slot)
        },
        getSkillByName: function() {
          return $scope.getSkillByName
        },
        set: function() {
          return gear
        },
        brands: function() {
          return $scope.brands
        },
        filterByMain: function() {
          return $scope.filterByMain
        },
        selectedGear: function() {
          return equipped
        },
        background: function() {
          if(slot=='head') {
            return 'redstripes'
          }
          else if(slot=='clothes') {
            return 'tealstripes'
          }
          else if(slot=='shoes') {
            return 'orangestripes'
          }
          else {
            return 'neonstripes'
          }
        }
      }
    });
    modalInstance.result.then(function(results) {
      $scope.equip(results.selected, slot)
      eval("$scope.loadout." + slot + ".equipped = results.selected")
      if(eval("$scope.loadout." + slot + ".main") == null) {
        eval(("$scope.loadout." + slot + ".main = $scope.getSkillByName('" + results.selected.main + "')"))
      }
      eval("$scope.loadout." + slot + ".equipped = results.selected")
    }, function() {

    });
  };

  $scope.openSpykeModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      template: templates["spyke"],
      windowTemplateUrl: 'blankModal.html',
      controller: 'BasicCtrl'
    });

    modalInstance.result.then(function(results) {
      var url = "http://spyke.h3xmani.ac/app/loadout?encoding=" + $scope.encodeLoadout();
      window.open(url,'_blank');
    }, function() {

    });    
  };

  $rootScope.openExcessiveAPModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      template: templates["excessiveAP"],
      windowTemplateUrl: 'blankModal.html',
      controller: 'BasicCtrl'
    });

    modalInstance.result.then(function(results) {

    }, function() {

    });
  };

  // Update modal
  var openUpdateModel = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      template: templates["update"],
      windowTemplateUrl: 'blankModal.html',
      controller: 'BasicCtrl'
    });

    modalInstance.result.then(function(results) {

    }, function() {

    });  
  }
  if (typeof(Storage) !== "undefined") {
    if(!localStorage.appVersion || localStorage.appVersion < $scope.appVersion) {
      localStorage.appVersion = $scope.appVersion;
      openUpdateModel();
    }
  }
});

angular.module('splatApp').controller('WeaponPickerCtrl', function($scope, $rootScope, $uibModalInstance, getSubByName, getSpecialByName, weaponSets, subs, selectedSet, selectedWeapon, $timeout) {
  $scope.selectedSet = selectedSet;
  $scope.weaponSets = weaponSets;
  $scope.selectedWeapon = selectedWeapon;

  $scope.weaponSearchFilter = function(value) {
    var langs = $rootScope.splatController.languages;
    var keys = Object.keys(langs);
    var searchText = document.getElementById("weaponSearchFilterText").value;
    
    // Filter on NAME
    for(var i = 0; i < keys.length;i++){
      if(value.localizedName[keys[i]].toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
        return true;
      }
    }

    // Filter on SPECIAL
    var specials = $rootScope.splatController.specials;
    var special = null;
    for(var i = 0; i < specials.length; i++){
      if(value.special != null && specials[i].name == value.special) {
        special = specials[i];
        break;
      }
    }
    if(special != null) {
      var keys = Object.keys(special.localizedName);
      for(var i = 0; i < keys.length;i++){
        if(special.localizedName[keys[i]].toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
          return true;
        }
      }
    }

    // Filter on SUB ABILITY
    var subs = $rootScope.splatController.subs;
    var sub = null;
    for(var i = 0; i < subs.length; i++){
      if(value.main != null && subs[i].name == value.main) {
        sub = subs[i];
        break;
      }
    }
    if(sub != null) {
      var keys = Object.keys(sub.localizedName);
      for(var i = 0; i < keys.length;i++){
        if(sub.localizedName[keys[i]].toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
          return true;
        }
      }
    }

    return false;
  };

  $scope.switchSet = function() {
    $scope.selectedWeapon = this.availableWeapons()[0];
  }

  $scope.selectWeapon = function(item) {
    $scope.selectedWeapon=item;
  }

  $scope.availableWeapons = function() {
    return this.selectedSet.weapons.filter(filter_available)
  }

  $scope.getSubByName = getSubByName

  $scope.getSubIcon = function(name) {
    return $scope.getSubByName(name).image;
  }

  $scope.getSpecialByName = getSpecialByName

  $scope.getSpecialIcon = function(name) {
    return $scope.getSpecialByName(name).image;
  }

  $scope.ok = function() {
    var scope = this;
    $timeout(function() {
      $uibModalInstance.close({'set' : scope.selectedSet, 'weapon': scope.selectedWeapon});
    }, modalCloseDelay);
  };

  $scope.cancel = function() {
    $timeout(function() {
      $uibModalInstance.dismiss('cancel');
    }, modalCloseDelay);
  };
});


angular.module('splatApp').controller('GearPickerCtrl', function($scope, $rootScope, $uibModalInstance, background, slot, set, brands, filterByMain, selectedGear, getSkillByName, $timeout) {
  $scope.slot = slot;
  $scope.set = set;
  $scope.filterByMain = filterByMain;
  $scope.selectedGear = selectedGear;
  $scope.getSkillByName = getSkillByName;
  $scope.brands = brands;
  $scope.background = background;

  $scope.gearSearchFilter = function(value) {
    var langs = $rootScope.splatController.languages;
    var keys = Object.keys(langs);
    var searchText = document.getElementById("gearSearchFilterText").value;
    
    // Filter on NAME
    for(var i = 0; i < keys.length;i++){
      if(value.localizedName[keys[i]].toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
        return true;
      }
    }

    // Filter on BRAND
    var brand = $rootScope.splatController.brands[value.brand];
    var keys = Object.keys(brand.localizedName);
    for(var i = 0; i < keys.length;i++){
      if(brand.localizedName[keys[i]].toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
        return true;
      }
    }

    // Filter on MAIN ABILITY
    var skills = $rootScope.splatController.skills;
    var skill = null;
    for(var i = 0; i < skills.length; i++){
      if(value.main != null && skills[i].name == value.main) {
        skill = skills[i];
        break;
      }
    }
    if(skill != null) {
      var keys = Object.keys(skill.localizedName);
      for(var i = 0; i < keys.length;i++){
        if(skill.localizedName[keys[i]].toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
          return true;
        }
      }
    }

    return false;
  };

  if(slot.main != null) {
    $scope.filtered = filterByMain(set,slot.main.name);
  }
  else {
    $scope.filtered = filterByMain(set,null);
  }

  $scope.selectGear = function(item) {
    $scope.selectedGear=item;
  }

  $scope.ok = function() {
    var scope = this;
    $timeout(function() {
      $uibModalInstance.close({selected : scope.selectedGear});
    }, modalCloseDelay);
  };

  $scope.cancel = function() {
    $timeout(function() {
      $uibModalInstance.dismiss('cancel');
    }, modalCloseDelay);
  };
});

angular.module('splatApp').controller('BasicCtrl', function($scope, $uibModalInstance, $timeout) {
  $scope.ok = function() {
    $timeout(function() {
      $uibModalInstance.close();
    }, modalCloseDelay);
  };

  $scope.cancel = function() {
    $timeout(function() {
      $uibModalInstance.dismiss('cancel');
    }, modalCloseDelay);
  };
});

function animateButton(self) {
    $(self).addClass("active");
    setTimeout(function() {
      $(".modal-backdrop").remove();
    }, modalCloseDelay);
}
