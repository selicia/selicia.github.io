function Stat(name, calc, max) {
  this.name = name;
  this.calc = calc;
  this.max = max;
  this.value = 0;
  this.desc = null;
  this.label = { label: null };
  this.calcMod = function(abilityScore) {
    return (0.99 * abilityScore - Math.pow(0.09 * abilityScore,2))
  }
  this.calcP = function(abilityScore) {
    return Math.min(3.3*abilityScore - 0.027*Math.pow(abilityScore,2),100);
  }
  this.calcS = function(values) {
    var max = values[0];
    var mid = values[1];
    var min = values[2];
    return (mid-min) / (max-min);
  }
  this.calcRes = function(values, p, s) {
    var max = values[0];
    var mid = values[1];
    var min = values[2];
    return min + (max-min) * this.lerpN(p/100, s);
  }
  this.lerpN = function(p, s) {
    if(s.toFixed(3) == 0.5) {
      return p;
    }
    if(p == 0.0) {
      return p;
    }
    if(p == 1.0) {
      return p;
    }
    if(s != 0.5) {
      return Math.pow(Math.E,-1 * (Math.log(p) * Math.log(s) / Math.log(2)))
      //return Math.log(-1 * (Math.log(p) * Math.log(s) / Math.log(2)));
    }
  }
}

angular.module('splatApp').stats = function ($scope) {
  $scope.stats = {
    'Swim Speed': new Stat("Swim Speed", function(loadout) {
      var default_swim_speed = null;
      var swim_speed_parameters = null;
      if(loadout.weapon.speedLevel == 'Low') {
        swim_speed_parameters = $scope.parameters["Swim Speed"]["Heavy"];
      }
      if(loadout.weapon.speedLevel == 'Middle') {
        swim_speed_parameters = $scope.parameters["Swim Speed"]["Mid"];
      }
      if(loadout.weapon.speedLevel == "High") {
        swim_speed_parameters = $scope.parameters["Swim Speed"]["Light"];
      }

      var abilityScore = loadout.calcAbilityScore('Swim Speed Up');      
      var p = this.calcP(abilityScore);

      if(loadout.hasAbility('Ninja Squid')) {
        p = p * 0.8;
      }

      var s = this.calcS(swim_speed_parameters);
      var swim_speed = this.calcRes(swim_speed_parameters, p, s);

      if(loadout.hasAbility('Ninja Squid')) {
        swim_speed = swim_speed * 0.9;
      }

      var delta = ((swim_speed / swim_speed_parameters[2] - 1) * 100).toFixed(1).toString();

      // Debug log
      var swim_speed_debug_log = {"Swim Speed":swim_speed,"AP":abilityScore,"P":p,"S":s,"Delta":delta}
      console.log(swim_speed_debug_log);

      this.value = swim_speed;
      this.percentage = delta;
      this.label = "{value} DU/f".format({value: $scope.toFixedTrimmed(this.value,4)});
      this.desc = "Distance Units/frame";
      return this.value.toFixed(4);
    }, 2.4),

    'Run Speed': new Stat("Run Speed", function(loadout) {
        var default_run_speed = null;
        var run_speed_parameters = null;
        if(loadout.weapon.speedLevel == 'Low') {
          run_speed_parameters = $scope.parameters["Run Speed"]["Heavy"];
        }
        if(loadout.weapon.speedLevel == 'Middle') {
          run_speed_parameters = $scope.parameters["Run Speed"]["Mid"];
        }
        if(loadout.weapon.speedLevel == "High") {
          run_speed_parameters = $scope.parameters["Run Speed"]["Light"];
        }

        var abilityScore = loadout.calcAbilityScore('Run Speed Up');        
        var p = this.calcP(abilityScore);       
        var s = this.calcS(run_speed_parameters);
        var run_speed = this.calcRes(run_speed_parameters, p, s);
        var delta = ((run_speed / run_speed_parameters[2] - 1) * 100).toFixed(1).toString();        
        
        // Debug log
        var run_speed_debug_log = {"Run Speed":run_speed,"AP":abilityScore,"P":p,"S":s,"Delta":delta}
        console.log(run_speed_debug_log);

        this.value = run_speed;
        this.percentage = delta;
        this.label = "{value} DU/f".format({value: $scope.toFixedTrimmed(this.value,4)})
        this.desc = "Distance Units/frame";
        return this.value.toFixed(4);
      }, 1.44),

    'Run Speed (Enemy Ink)': new Stat("Run Speed (Enemy Ink)", function(loadout) {
        // TODO: Verify these results with Leanny
        var ink_resistance_parameters = $scope.parameters["Ink Resistance"]["Run"];
        var abilityScore = loadout.calcAbilityScore('Ink Resistance Up');
        var p = this.calcP(abilityScore);       
        var s = this.calcS(ink_resistance_parameters);
        var run_speed = this.calcRes(ink_resistance_parameters, p, s);
        var delta = ((run_speed / ink_resistance_parameters[2] - 1) * 100).toFixed(1).toString();        
        
        // Debug log
        var run_speed_debug_log = {"Enemy Ink Run Speed":run_speed,"AP":abilityScore,"P":p,"S":s,"Delta":delta}
        console.log(run_speed_debug_log);
        /*  Not sure why the old Loadout site had significantly different values for
            this stat then Leanny's formula. His follows the same results here:
            See: https://gamefaqs.gamespot.com/boards/200279-splatoon-2/75638591#5 
        */
        console.log("Ink Resist DEBUG: " + run_speed * loadout.weapon.baseSpeed)

        this.value = run_speed
        this.percentage = delta;
        this.label = "{value} DU/f".format({value: $scope.toFixedTrimmed(this.value,4)});
        this.desc = "Distance Units/frame";
        return this.value.toFixed(4);
      }, 0.72),

    'Run Speed (Firing)': new Stat("Run Speed (Firing)", function(loadout) {
      if(loadout.weapon.name.toLowerCase().indexOf('brush') != -1 || loadout.weapon.name.toLowerCase().indexOf('roller') != -1) {
          this.value = loadout.weapon.baseSpeed;
          this.percentage = 0.0;
          this.name = "Run Speed (Rolling)"
          this.label = "{value} DU/f".format({value: this.value.toFixed(2)});
          this.desc = "Roll Speed for Rollers and Brushes is constant.";
          return this.value.toFixed(2);
        }
        else {
          this.name = "Run Speed (Firing)"
        }

        var run_speed_parameters = $scope.parameters["Run Speed"]["Shooting"];
        var abilityScore = loadout.calcAbilityScore('Run Speed Up');
        var p = this.calcP(abilityScore);       
        var s = this.calcS(run_speed_parameters);
        var run_speed = this.calcRes(run_speed_parameters, p, s) * loadout.weapon.baseSpeed;
        var delta = ((run_speed / loadout.weapon.baseSpeed - 1) * 100).toFixed(1).toString();        

        // Debug log
        var run_speed_debug_log = {"Run Speed (Firing)":run_speed,"AP":abilityScore,"P":p,"S":s,"Delta":delta}
        console.log(run_speed_debug_log);

        this.value = run_speed
        this.percentage = delta;
        this.label = "{value} DU/f".format({value: $scope.toFixedTrimmed(this.value,4)});
        this.desc = "Distance Units/frame";

        if(isNaN(this.value)) {
          this.value = 0;
          this.label = "Unavailable";
          this.desc = null;
        }
        return this.value.toFixed(4);
      }, 1.44),

    'Ink Recovery Speed (Squid)': new Stat("Ink Recovery Speed (Squid)", function(loadout) {
      var ink_recovery_parameters = $scope.parameters["Ink Recovery Up"]["In Ink"];
      var abilityScore = loadout.calcAbilityScore('Ink Recovery Up');
      var p = this.calcP(abilityScore);       
      var s = this.calcS(ink_recovery_parameters);
      var refill_rate = this.calcRes(ink_recovery_parameters, p, s);
      var refill_time = refill_rate / 60;
      var delta = 3 / refill_time * 100;

      // Debug log
      var refill_speed_squid_debug_log = {"Ink Recovery Speed (Squid)":refill_rate,"time":refill_time,"AP":abilityScore,"P":p,"S":s,"Delta":delta}
      console.log(refill_speed_squid_debug_log);

      this.value = delta;
      this.percentage = (100 - (100 / delta) * 100).toFixed(1);
      this.desc = "{value}s from empty to full".format({value: refill_time.toFixed(2)})
      this.label = "{value}s".format({value: refill_time.toFixed(2)})
      return this.value.toFixed(2);
    }, 154),

    'Ink Recovery Speed (Kid)': new Stat("Ink Recovery Speed (Kid)", function(loadout) {
      var ink_recovery_parameters = $scope.parameters["Ink Recovery Up"]["Standing"];
      var abilityScore = loadout.calcAbilityScore('Ink Recovery Up');
      var p = this.calcP(abilityScore);       
      var s = this.calcS(ink_recovery_parameters);
      var refill_rate = this.calcRes(ink_recovery_parameters, p, s);
      var refill_time = refill_rate / 60;
      var delta = 10 / refill_time * 100;

      // Debug log
      var refill_speed_squid_debug_log = {"Ink Recovery Speed (Kid)":refill_rate,"time":refill_time,"AP":abilityScore,"P":p,"S":s,"Delta":delta}
      console.log(refill_speed_squid_debug_log);

      this.value = delta;
      this.percentage = (100 - (100 / delta) * 100).toFixed(1);
      this.desc = "{value}s from empty to full".format({value: refill_time.toFixed(2)})      
      this.label = "{value}s".format({value: refill_time.toFixed(2)})
      return this.value.toFixed(2);
    }, 273),

    'Ink Consumption (Main)': new Stat("Ink Consumption (Main)", function(loadout) {
      var ink_saver_parameters = null;
      if(loadout.weapon.inkSaver == 'Low') {
        ink_saver_parameters = $scope.parameters["Ink Saver Main"]["Low"];
      }
      if(loadout.weapon.inkSaver == 'Middle') {
        ink_saver_parameters = $scope.parameters["Ink Saver Main"]["Mid"];
      }
      if(loadout.weapon.inkSaver == "High") {
        ink_saver_parameters = $scope.parameters["Ink Saver Main"]["High"];
      }

      var abilityScore = loadout.calcAbilityScore('Ink Saver (Main)');
      var p = this.calcP(abilityScore);       
      var s = this.calcS(ink_saver_parameters);
      var reduction = this.calcRes(ink_saver_parameters, p, s);
      
      var costPerShot = loadout.weapon.inkPerShot * reduction;
      this.desc = "{totalShots} to empty ({reduction}% reduction)".format({totalShots: Math.floor(100/costPerShot), reduction: (100 - (reduction*100)).toFixed(1)})
      this.label = "{value}% tank/{unit}".format({value: $scope.toFixedTrimmed(costPerShot,3), unit: loadout.weapon.shotUnit})
      this.value = costPerShot;
      this.percentage = (100 - (reduction*100)).toFixed(1);

      // Debug log
      var ink_saver_debug_log = {"Ink Saver (Main)":costPerShot,"AP":abilityScore,"P":p,"S":s,"Delta":reduction}
      console.log(ink_saver_debug_log);

      if(isNaN(this.value)) {
        this.value = 0;
        this.label = "Unavailable";
        this.desc = null;
      }
      return this.value;
    }, 100),

    'Ink Consumption (Sub)': new Stat("Ink Consumption (Sub)", function(loadout) {
      var ink_saver_sub_parameters = null;
      if(loadout.weapon.inkSaver == 'Low') {
        ink_saver_sub_parameters = $scope.parameters["Ink Saver Sub"]["Low"];
      }
      if(loadout.weapon.inkSaver == 'Middle') {
        ink_saver_sub_parameters = $scope.parameters["Ink Saver Sub"]["Mid"];
      }
      if(loadout.weapon.inkSaver == "High") {
        ink_saver_sub_parameters = $scope.parameters["Ink Saver Sub"]["High"];
      }      
      var abilityScore = loadout.calcAbilityScore('Ink Saver (Sub)');
      var p = this.calcP(abilityScore);       
      var s = this.calcS(ink_saver_sub_parameters);
      var reduction = this.calcRes(ink_saver_sub_parameters, p, s);
      
      var sub = $scope.getSubByName(loadout.weapon.sub)
      var costPerSub = sub.cost * reduction;

      this.desc = "{reduction}% reduction".format({reduction: (100 - (reduction*100)).toFixed(1)})
      this.label = "{value}% tank".format({value: $scope.toFixedTrimmed(costPerSub,3)})      
      this.localizedDesc = { reduction: (100 - (reduction*100)).toFixed(1), desc: 'DESC_SUB_COST' };
      this.value = costPerSub;
      this.percentage = (100 - (reduction*100)).toFixed(1);

      // Debug log
      var ink_saver_sub_debug_log = {"Ink Saver (Sub)":costPerSub,"AP":abilityScore,"P":p,"S":s,"Delta":reduction}
      console.log(ink_saver_sub_debug_log);

      return costPerSub;
    }, 100),

    'Special Charge Speed': new Stat("Special Charge Speed", function(loadout) {
      var special_charge_speed_parameters = $scope.parameters["Special Charge Up"]["default"]
      var abilityScore = loadout.calcAbilityScore('Special Charge Up');
      var p = this.calcP(abilityScore);       
      var s = this.calcS(special_charge_speed_parameters);
      var special_charge_speed = this.calcRes(special_charge_speed_parameters, p, s);      

      this.value = special_charge_speed;
      this.percentage = ((special_charge_speed*100) - 100).toFixed(1);
      this.desc = "{value}p for special".format({value: Math.round(loadout.weapon.specialCost / special_charge_speed)})
      this.label = "{value}%".format({value: (this.value*100).toFixed(1)});

      // Debug log
      var special_charge_speed_debug_log = {"Special Charge Speed":special_charge_speed,"AP":abilityScore,"P":p,"S":s,"Delta":this.percentage}
      console.log(special_charge_speed_debug_log);

      return (special_charge_speed * 100).toFixed(1);
    }, 1.3),

    'Special Saved': new Stat("Special Saved", function(loadout) {
      var special_saver_parameters = null;
      if(loadout.weapon.special == "Splashdown") {
        special_saver_parameters = $scope.parameters["Special Saver"]["Splashdown"];
      }
      else {
        special_saver_parameters = $scope.parameters["Special Saver"]["default"];        
      }
      
      var abilityScore = loadout.calcAbilityScore('Special Saver');
      if(loadout.hasAbility('Respawn Punisher')) {
        abilityScore = abilityScore * 0.7;
        this.desc = "Respawn Punisher is affecting this stat.";
      }

      var p = this.calcP(abilityScore);       
      var s = this.calcS(special_saver_parameters);
      var modifier = this.calcRes(special_saver_parameters, p, s);
      
      var special_saved = 100.0 * modifier;

      if(loadout.hasAbility('Respawn Punisher')) {
        special_saved = special_saved * .225;
      }

      // Debug log
      var special_saver_debug_log = {"Special Saver":special_saved,"AP":abilityScore,"Delta":modifier}
      console.log(special_saver_debug_log);

      this.value = special_saved;
      this.percentage = $scope.toFixedTrimmed((modifier - 0.5) * 100, 2);
      this.localizedDesc = { desc: null }; // TODO: Verify what this actually does      
      this.label = "{value}%".format({value: (special_saved).toFixed(1)});
      return special_saved.toFixed(1);
    }, 100),

    'Special Power': new Stat("Special Power", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Special Power Up');
      var equippedSpecial = $scope.getSpecialByName(loadout.weapon.special)
      this.desc = null;
      this.name = "Special Power<br>(???)"

      var special_power_up_parameters = null;
      switch(equippedSpecial.name) {
        case 'Curling-Bomb Launcher':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Curling Bomb Launcher"];
          var p = this.calcP(abilityScore);
          var s = this.calcS(special_power_up_parameters);
          var duration = this.calcRes(special_power_up_parameters, p, s) / 60;
          var max_duration = special_power_up_parameters[0] / 60;
          var min_duration = special_power_up_parameters[2] / 60;

          this.name = "Special Power<br>(Duration)";

          var special_power_up_log = {"Special Power Up (Curling Bomb Launcher)":duration,"AP:":abilityScore,"P":p,"S":s}
          console.log(special_power_up_log);

          this.percentage = $scope.toFixedTrimmed((((duration/min_duration) - 1) * 100),2);
          this.value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          this.label = "{value}s".format({value: $scope.toFixedTrimmed(duration,2)});
          return duration;

        case 'Suction-Bomb Launcher':
        case 'Burst-Bomb Launcher':
        case 'Autobomb Launcher':
        case 'Splat-Bomb Launcher':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Other Bomb Launcher"];
          var p = this.calcP(abilityScore);
          var s = this.calcS(special_power_up_parameters);
          var duration = this.calcRes(special_power_up_parameters, p, s) / 60;
          var max_duration = special_power_up_parameters[0] / 60;
          var min_duration = special_power_up_parameters[2] / 60;

          this.name = "Special Power<br>(Duration)";

          var special_power_up_log = {"Special Power Up (Other Bomb Launcher)":duration,"AP:":abilityScore,"P":p,"S":s}
          console.log(special_power_up_log);

          this.percentage = $scope.toFixedTrimmed((((duration/min_duration) - 1) * 100),2);
          this.value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          this.label = "{value}s".format({value: $scope.toFixedTrimmed(duration,2)});
          return duration;

        case 'Ink Armor':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Ink Armor Duration"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var duration = this.calcRes(special_power_up_parameters, p, s) / 60;
          var max_duration = special_power_up_parameters[0] / 60;
          var min_duration = special_power_up_parameters[2] / 60;

          this.value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          this.percentage = ((duration/min_duration - 1) * 100).toFixed(1);

          var special_power_up_log = {"Special Power Up (Ink Armor)":duration,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);
          
          this.name = "Special Power<br>(Duration)";
          this.label = "{value}s".format({value: $scope.toFixedTrimmed(duration,2)});
          return duration;

        case 'Inkjet':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Inkjet Duration"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var duration = this.calcRes(special_power_up_parameters, p, s) / 60;
          var max_duration = special_power_up_parameters[0] / 60;
          var min_duration = special_power_up_parameters[2] / 60;

          this.value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          this.percentage = ((duration/min_duration - 1) * 100).toFixed(1);

          var special_power_up_log = {"Special Power Up (Inkjet)":duration,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);
          
          this.name = "Special Power<br>(Duration)";
          this.label = "{value}s".format({value: $scope.toFixedTrimmed(duration,2)});
          return duration;

        case 'Ink Storm':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Ink Storm Duration"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var duration = this.calcRes(special_power_up_parameters, p, s) / 60;
          var max_duration = special_power_up_parameters[0] / 60;
          var min_duration = special_power_up_parameters[2] / 60;

          this.value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          this.percentage = ((duration/min_duration - 1) * 100).toFixed(1);

          var special_power_up_log = {"Special Power Up (Ink Storm)":duration,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);
          
          this.name = "Special Power<br>(Duration)";     
          this.label = "{value}s".format({value: $scope.toFixedTrimmed(duration,2)});
          return duration;

        case 'Sting Ray':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Ink Storm Duration"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var duration = this.calcRes(special_power_up_parameters, p, s) / 60;
          var max_duration = special_power_up_parameters[0] / 60;
          var min_duration = special_power_up_parameters[2] / 60;

          this.value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          this.percentage = ((duration/min_duration - 1) * 100).toFixed(1);

          var special_power_up_log = {"Special Power Up (Ink Storm)":duration,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);
          
          this.name = "Special Power<br>(Duration)";        
          this.label = "{value}s".format({value: $scope.toFixedTrimmed(duration,2)});
          return duration;

        case 'Baller':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Baller HP"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var health = this.calcRes(special_power_up_parameters, p, s) / 10;
          var max_health = special_power_up_parameters[0] / 10;
          var min_health = special_power_up_parameters[2] / 10;

          this.value = $scope.toFixedTrimmed((health/max_health) * 100,2);
          this.percentage = ((health/min_health - 1) * 100).toFixed(1);

          var special_power_up_log = {"Special Power Up (Baller)":health,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);
          
          this.name = "Special Power<br>(Baller HP)";       
          this.label = "{value} HP".format({value: $scope.toFixedTrimmed(health,2)});
          return health;

        case 'Tenta Missiles':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Tenta Missiles Target Circle Radius"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var targeting_radius = this.calcRes(special_power_up_parameters, p, s);
          var max_targeting_radius = special_power_up_parameters[0];
          var min_targeting_radius = special_power_up_parameters[2];

          this.value = $scope.toFixedTrimmed((targeting_radius/max_targeting_radius) * 100,2);
          this.percentage = ((targeting_radius/min_targeting_radius - 1) * 100).toFixed(1);

          var special_power_up_log = {"Special Power Up (Tenta Missiles)":targeting_radius,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);

          this.name = "Special Power<br>(Targeting Radius)";
          this.label = "{value}".format({value: $scope.toFixedTrimmed(targeting_radius,2)})
          return targeting_radius;

        case 'Splashdown':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Splash Down Burst Radius Close"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var lethal_radius = this.calcRes(special_power_up_parameters, p, s);
          var max_lethal_radius = special_power_up_parameters[0];
          var min_lethal_radius = special_power_up_parameters[2];

          this.value = $scope.toFixedTrimmed((lethal_radius/max_lethal_radius) * 100,2);
          this.percentage = ((lethal_radius/min_lethal_radius - 1) * 100).toFixed(1);
          
          var special_power_up_log = {"Special Power Up (Splashdown)":lethal_radius,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);

          this.name = "Special Power<br>(Lethal Radius)";
          this.label = "{value}".format({value: $scope.toFixedTrimmed(lethal_radius,2)})
          // TODO: Ask Leanny how to convert the Lethal Radius values to Distance Units (DU/f)
          // this.desc = "{value} Distance Units".format({value: (base*results).toFixed(1)})
          return lethal_radius;

        case 'Bubble Blower':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Bubble Blower Bubble Radius Multiplier"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var modifier = this.calcRes(special_power_up_parameters, p, s);
          var max_bubble_radius = special_power_up_parameters[0] * equippedSpecial.radius["Max"];
          var min_bubble_radius = special_power_up_parameters[2] * equippedSpecial.radius["Max"];
          var bubble_radius = modifier * equippedSpecial.radius["Max"];

          this.value = $scope.toFixedTrimmed((bubble_radius/max_bubble_radius) * 100,2);
          this.percentage = ((bubble_radius/min_bubble_radius - 1) * 100).toFixed(1);
          
          var special_power_up_log = {"Special Power Up (Bubble Blower)":bubble_radius,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);

          this.name = "Special Power<br>(Max Bubble Radius)";
          this.label = "{value}".format({value: $scope.toFixedTrimmed(bubble_radius,2)})
          return bubble_radius;

        case 'Booyah Bomb':
          special_power_up_parameters = $scope.parameters["Special Power Up"]["Booyah Ball Auto Charge Increase"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(special_power_up_parameters);
          var modifier = this.calcRes(special_power_up_parameters, p, s);
          var charge_time = equippedSpecial.duration - (equippedSpecial.duration * modifier);
          var max_charge_time = equippedSpecial.duration - (equippedSpecial.duration * special_power_up_parameters[2]);
          var min_charge_time = equippedSpecial.duration - (equippedSpecial.duration * special_power_up_parameters[0]);
        
          this.percentage = Math.abs(((charge_time/max_charge_time - 1) * 100).toFixed(2));
          this.value = 100 - (this.percentage * 100);
          
          var special_power_up_log = {"Special Power Up (Booyah Bomb)":charge_time,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
          console.log(special_power_up_log);

          this.name = "Special Power<br>(Max Charge Time)";
          this.label = "{value}s".format({value: $scope.toFixedTrimmed(charge_time,4)})
          return charge_time;
      }
      return 0; // Default return value
    }, 100),

    'Sub Power': new Stat("Sub Power", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Sub Power Up');
      var equippedSub = $scope.getSubByName(loadout.weapon.sub)
      this.name = "Sub Power<br>(Bomb Range)"
      this.value = 0;
      switch(equippedSub.name) {
        case 'Burst Bomb':
        case 'Splat Bomb':
        case 'Suction Bomb':
        case 'Autobomb':
        case 'Point Sensor':
        case 'Toxic Mist':
          var range = (1 + this.calcMod(abilityScore) / 60)
          this.value = range*100;
          this.label = "{value}%".format({value: this.value.toFixed(1)})
          this.name = "Sub Power<br>(Bomb Range)";
          this.max = 150;
          return (range * 100).toFixed(1);
          break;
        case 'Curling Bomb':
          this.name = "Sub Power<br>(Bomb Speed)";
          this.label = "Unavailable";
          break;
        case 'Ink Mine':
          this.name = "Sub Power<br>(Mine Radius)";
          this.label = "Unavailable";
          break;
        case 'Splash Wall':
          this.name = "Sub Power<br>(Wall HP)";
          this.label = "Unavailable";
          var HP = 800 * (1 + this.calcMod(abilityScore) / (240/7))
          this.value = HP;
          this.label = "{value} HP".format({value: this.value.toFixed(2)});
          this.max = 1500;
          break;
        case 'Sprinkler':
          this.name = "Sub Power<br>(Full-Power Duration)";
          this.label = "Unavailable";
          break;
        case 'Squid Beakon':
          this.name = "Sub Power<br>(Jump Speed to Beakon)";
          this.label = "Unavailable";
          break;
      }
      return (range * 100).toFixed(1);
    }, 150),
    'Super Jump Time (Squid)': new Stat("Super Jump Time (Squid) *", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Quick Super Jump');
      var mod = this.calcMod(abilityScore)
      var totalFrames = (-1/75)*Math.pow(mod,2) - (84/25)*mod + 218
      this.value = (totalFrames) / 60
      this.label = "{value}s".format({value: this.value.toFixed(2)});
      return ((totalFrames) / 60).toFixed(2);
    }, 3.65),
    'Super Jump Time (Kid)': new Stat("Super Jump Time (Kid) *", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Quick Super Jump');
      var mod = this.calcMod(abilityScore)
      var totalFrames = (-1/75)*Math.pow(mod,2) - (84/25)*mod + 239
      this.value = totalFrames / 60
      this.label = "{value}s".format({value: this.value.toFixed(2)});
      return (totalFrames / 60).toFixed(2);
    }, 4),
    //TODO: This is WRONG! Need more data on Respawn Punisher!
    'Quick Respawn Time': new Stat("Quick Respawn Time", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Quick Respawn');
      this.name = "Quick Respawn Time";
      this.desc = "Respawn time when splatted without splatting others.";
      var death = 30;
      var splatcam = 354;
      var spawn = 120;
      var mod = this.calcMod(abilityScore)/60
      if(loadout.hasAbility('Respawn Punisher')) {
        this.name = "Quick Respawn Time *";
        this.desc = "Respawn Punisher is affecting this stat.";
        mod *= 0.5;
        splatcam += 74;
      }
      var spawnFrames = death + (splatcam*(1-mod)) + spawn;
      this.value = spawnFrames/60
      this.label = "{value}s".format({value: this.value.toFixed(2)});
      return this.value.toFixed(2)
    }, 9.6),
    'Tracking Time': new Stat("Tracking Time *", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Cold-Blooded');
      var trackReduction = this.calcMod(abilityScore) / 40
      this.value = (8 * (1 - trackReduction))
      this.label = "{value}s".format({value: this.value.toFixed(2)});
      this.desc = "Point Sensor/Ink Mine duration";
      return (8 * (1 - trackReduction)).toFixed(2);
    }, 8)
  }


  $scope.getStatByName = function(name) {
    return $scope.stats[name]
  }
  $scope.getAdjustedSubSpeDamage = function(sub,loadout) {
  var abilityScore = loadout.calcAbilityScore('Bomb Defense Up');
  var coeff;
  switch(sub.name) {
    case 'Burst Bomb':
      coeff = 75;
      break;
    case 'Splat Bomb':
    case 'Suction Bomb':
    case 'Autobomb':
    case 'Curling Bomb':
    case 'Ink Mine':
      coeff = 60;
      break;
    default:
      coeff = (600/7);
      break;
  }
  var damageReduction = (1 - (0.99 * abilityScore - Math.pow(0.09 * abilityScore,2)) / coeff)
    var results = {}
    for(damageValue in sub.damage) {
      var subDamage = sub.damage[damageValue]
      if(subDamage >= 100) {
        results[damageValue] = subDamage.toFixed(1);
      } else {
        results[damageValue] = (subDamage * damageReduction).toFixed(1);
      }
    }
    return results
  }
  $scope.getAdjustedSpecialCost = function(loadout) {
    var stat = $scope.getStatByName('Special Charge Speed');
    return Math.floor(loadout.weapon.specialCost / (stat.value))
  }
}
