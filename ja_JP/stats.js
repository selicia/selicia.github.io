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
      return Math.log(-1 * (Math.log(p) * Math.log(s) / Math.log(2)));
    }
  }
}

angular.module('splatApp').stats = function ($scope) {
  $scope.stats = {
    'Swim Speed': new Stat("イカダッシュ速度", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Swim Speed Up');
      console.log("AP: " + abilityScore);
      var p = this.calcP(abilityScore);
      if(loadout.hasAbility('Ninja Squid')) {
        p = p * 0.8;
      }
      console.log("P: " + p);
      var s = null;
      var res = null;
      if(loadout.weapon.speedLevel == 'Low') {
        s = this.calcS($scope.parameters["Swim Speed"]["Heavy"]);
        res = this.calcRes($scope.parameters["Swim Speed"]["Heavy"], p, s);
      }
      if(loadout.weapon.speedLevel == 'Middle') {
        s = this.calcS($scope.parameters["Swim Speed"]["Mid"]);
        res = this.calcRes($scope.parameters["Swim Speed"]["Mid"], p, s);          
      }
      if(loadout.weapon.speedLevel == "High") {
        s = this.calcS($scope.parameters["Swim Speed"]["Light"]);
        res = this.calcRes($scope.parameters["Swim Speed"]["Light"], p, s);          
      }
      console.log("S: " + s);
      console.log("RES: " + res);
      var speed = res;
      if(loadout.hasAbility('Ninja Squid')) {
        speed = speed * 0.9;
      }
      this.value = speed;
      this.label = "{value} DU/f".format({value: this.value.toFixed(4)})
      this.desc = "DU/f = Distance Unit Per Frame(1フレームに移動できる距離単位)で、試し撃ちラインが50D";
      console.log("SPEED: " + speed.toFixed(4));
      return speed.toFixed(3);
    }, 2.4),
    'Run Speed': new Stat("ヒト移動速度", function(loadout) {
        var abilityScore = loadout.calcAbilityScore('Run Speed Up');
        var baseSpeed = 0.96;
        var coeff = 60;
        if(loadout.weapon.speedLevel == 'High') {
          baseSpeed = 1.04;
          coeff = 78;
        }
        if(loadout.weapon.speedLevel == 'Low') {
          baseSpeed = 0.88;
          coeff = (420/9);
        }
        var speed = baseSpeed * (1 + this.calcMod(abilityScore)/coeff);
        this.value = speed;
        this.label = "{value} DU/f".format({value: this.value.toFixed(2)})
        this.desc = "DU/f = Distance Unit Per Frame(1フレームに移動できる距離単位)で、試し撃ちラインが50D";
        return speed.toFixed(2);
      }, 1.44),
    'Run Speed (Enemy Ink)': new Stat("ヒト移動速度 (相手のインク)", function(loadout) {
        var abilityScore = loadout.calcAbilityScore('Ink Resistance Up');
        var baseSpeed = 0.32;
        var speed = baseSpeed * (1 + ((0.99 * abilityScore) - Math.pow(0.09 * abilityScore,2)) / 15)
        this.value = speed
        this.label = "{value} DU/f".format({value: this.value.toFixed(2)});
        this.desc = "DU/f = Distance Unit Per Frame(1フレームに移動できる距離単位)で、試し撃ちラインが50D";
        return this.value.toFixed(1);
      }, 1.44),
    'Run Speed (Firing)': new Stat("ヒト移動速度 (発射中)", function(loadout) {
        var abilityScore = loadout.calcAbilityScore('Run Speed Up');
        if(loadout.weapon.name.toLowerCase().indexOf('brush') != -1 || loadout.weapon.name.toLowerCase().indexOf('roller') != -1) {
          this.name = "ヒト移動速度 (スライド中)"
          var speed = loadout.weapon.baseSpeed;
          this.value = speed;
          this.label = "{value} DU/f".format({value: this.value.toFixed(2)});
          return speed.toFixed(2);
        }
        else {
          this.name = "ヒト移動速度 (発射中)"
        }
        var weaponRSU = 1 + this.calcMod(abilityScore)/120.452
        var speed = loadout.weapon.baseSpeed * (weaponRSU);
        this.value = speed
        this.label = "{value} DU/f".format({value: this.value.toFixed(2)});
        this.desc = "DU/f = Distance Unit Per Frame(1フレームに移動できる距離単位)で、試し撃ちラインが50D";
        if(isNaN(this.value)) {
          this.value = 0;
          this.label = "表示不可";
          this.desc = null;
        }
        return this.value.toFixed(1);
      }, 1.44),
    'Ink Recovery Speed (Squid)': new Stat("インク回復力 (イカ)", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Ink Recovery Up');
      var seconds = 3 * (1 - this.calcMod(abilityScore) / (600 / 7))
      this.desc = "満タンから空まで{value}秒".format({value: seconds.toFixed(2)})
      this.value = ((3 / seconds) * 100)
      this.label = "{value}%".format({value: this.value.toFixed(1)})
      return this.value.toFixed(1);
    }, 154),
    'Ink Recovery Speed (Kid)': new Stat("インク回復力 (ヒト)", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Ink Recovery Up');
      var seconds = 10 * (1 - this.calcMod(abilityScore) / 50)
      this.value = ((10 / seconds) * 100);
      this.desc = "満タンから空まで{value}秒".format({value: seconds.toFixed(2)})
      this.label = "{value}%".format({value: this.value.toFixed(1)})
      return this.value.toFixed(1);
    }, 251),
    'Ink Consumption (Main)': new Stat("メインウェポンの消費インク量", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Ink Saver (Main)');
      this.name = "メインウェポンの消費インク量"
      var coeff = (200 / 3)
      var reduction =  this.calcMod(abilityScore) / coeff
      var mod = this.calcMod(abilityScore)
      if(loadout.weapon.inkSaver == 'High') {
        reduction = Math.abs(Math.pow(mod,2)/4500 - (7*mod)/300)
        this.name = "メインウェポンの消費インク量 *"
      } else {
        reduction = mod / coeff
      }
      var costPerShot = loadout.weapon.inkPerShot * (1 - reduction)
      this.desc = "満タンから空まで{totalShots}回 ({reduction}% 減少)".format({totalShots: Math.floor(100/costPerShot), reduction: (reduction*100).toFixed(1)})
      this.label = "{unit}ごとにタンクの{value}% ".format({value: costPerShot.toFixed(1), unit: loadout.weapon.shotUnit})
      this.value = costPerShot;
      if(isNaN(this.value)) {
        this.value = 0;
        this.label = "表示不可";
        this.desc = null;
      }
      return this.value;
    }, 100),
    'Ink Consumption (Sub)': new Stat("サブウェポンの消費インク量", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Ink Saver (Sub)');
      this.name = "サブウェポンの消費インク量"
      var coeff = (600 / 7)
      var sub = $scope.getSubByName(loadout.weapon.sub)
      if(sub.inkSaver == 'Low') coeff = 100
      var reduction =  this.calcMod(abilityScore) / coeff
      // TODO: Hacky 2.0 balance fix. Possibly inaccurate.
      switch(sub.name) {
        case 'Burst Bomb':
          reduction *= (2/3)
          this.name = "サブウェポンの消費インク量 *"
          break
        case 'Toxic Mist':
          reduction *= 0.86
          this.name = "サブウェポンの消費インク量 *"
          break
      }
      var costPerSub = sub.cost * (1 - reduction)
      this.value = costPerSub;
      this.localizedDesc = { reduction: reduction.toFixed(1), desc: 'DESC_SUB_COST' };
      this.desc = "{reduction}% 減少".format({reduction: reduction.toFixed(1)})
      this.label = "タンクの{value}%".format({value: this.value.toFixed(2)})
      return costPerSub;
    }, 100),
    'Special Charge Speed': new Stat("スペシャルゲージの増加量", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Special Charge Up');
      var chargeSpeed = (1 + this.calcMod(abilityScore) / 100)
      this.value = chargeSpeed;
      this.desc = "スペシャルがたまるまでの塗りポイントが{value}p".format({value: Math.round(loadout.weapon.specialCost / chargeSpeed)})
      this.label = "{value}%".format({value: (this.value*100).toFixed(1)});
      return (chargeSpeed * 100).toFixed(1);
    }, 1.3),
    'Special Saved': new Stat("復活後のスペシャルゲージの残り", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Special Saver');
      this.localizedDesc = { desc: null };
      var y = this.calcMod(abilityScore)
      var kept = (1/4500) * Math.pow(y,2) + (1/100)*y + 0.5
      if(loadout.hasAbility('Respawn Punisher')) {
        kept -= .225;
        this.desc = "復活ペナルティの効果はまだ調査中。";
      }
      this.value = kept;
      this.label = "{value}%".format({value: (this.value*100).toFixed(1)});
      return (kept * 100).toFixed(1);
    }, 1),
//TODO: clean this up a bit
    'Special Power': new Stat("スペシャル性能", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Special Power Up');
      var equippedSpecial = $scope.getSpecialByName(loadout.weapon.special)
      var coeff = 0;
      var base = 0;
      var results = 0;
      this.desc = null;
      this.name = "スペシャル性能<br>(???)"
      switch(equippedSpecial.name) {
        case 'Suction-Bomb Launcher':
        case 'Burst-Bomb Launcher':
        case 'Curling-Bomb Launcher':
        case 'Autobomb Launcher':
        case 'Splat-Bomb Launcher':
          coeff = 90;
          base = 360;
          this.max = 8.1;
          this.name = "スペシャル性能<br>(時間)"
          results = (base * (1 +this.calcMod(abilityScore) / coeff))/60
          this.value = results;
          this.label = "{value}秒".format({value: this.value.toFixed(2)});
          return results.toFixed(2);
          break;
        case 'Ink Armor':
          coeff = 60;
          base = 360;
          this.max = 9;
          this.name = "スペシャル性能<br>(時間)"
          results = (base * (1 +this.calcMod(abilityScore) / coeff))/60
          this.value = results;
          this.label = "{value}秒".format({value: this.value.toFixed(2)});
          return results.toFixed(2);
          break;
        case 'Inkjet':
        case 'Ink Storm':
        case 'Sting Ray':
          coeff = 120;
          base = 465;
          this.max = 10;
          this.name = "スペシャル性能<br>(時間)"
          results = (base * (1 +this.calcMod(abilityScore) / coeff))/60
          this.value = results;
          this.label = "{value}秒".format({value: this.value.toFixed(2)});
          return results.toFixed(2);
          break;
        case 'Baller':
          coeff = 60;
          base = 400;
          this.max = 600;
          this.name = "スペシャル性能<br>(イカスフィアの耐久力)"
          results = (base * (1 +this.calcMod(abilityScore) / coeff))
          this.value = results;
          this.label = "{value} HP".format({value: this.value.toFixed(2)});
          return results.toFixed(1);
          break;
        case 'Tenta Missiles':
          coeff = 45;
          base = 4.8;
          this.max = 8;
          this.max = '166'
          this.name = "スペシャル性能<br>(索敵範囲の拡大)"
          results = (1 +this.calcMod(abilityScore) / coeff)*100
          this.value = results;
          this.label = "{value}%".format({value: this.value.toFixed(1)})
          return results.toFixed(1);
          break;
        case 'Splashdown':
          coeff = 110;
          base = 110;
          this.max = 1.274;
          this.name = "スペシャル性能<br>(爆風範囲拡大)"
          results = (1 +this.calcMod(abilityScore) / coeff)
          this.desc = "{value} 距離単位".format({value: (base*results).toFixed(1)})
          this.value = results;
          this.label = "{value}%".format({value: (results*100).toFixed(1)})
          return (results*100).toFixed(1);
          break;
        case 'Bubble Blower':
          this.name = "スペシャル性能<br>(泡のサイズの拡大)";
          this.value = 0;
          this.label = "表示不可";
          break;
      }
      return results;
    }, 100),
//TODO: get effects for all subs
    'Sub Power': new Stat("サブ性能", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Sub Power Up');
      var equippedSub = $scope.getSubByName(loadout.weapon.sub)
      this.name = "サブ性能<br>(飛距離)"
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
          this.name = "サブ性能<br>(飛距離)";
          this.max = 150;
          return (range * 100).toFixed(1);
          break;
        case 'Curling Bomb':
          this.name = "サブ性能<br>(速度)";
          this.label = "表示不可";
          break;
        case 'Ink Mine':
          this.name = "サブ性能<br>(効果範囲)";
          this.label = "表示不可";
          break;
        case 'Splash Wall':
          this.name = "サブ性能<br>(耐久力)";
          this.label = "表示不可";
          var HP = 800 * (1 + this.calcMod(abilityScore) / (240/7))
          this.value = HP;
          this.label = "{value} HP".format({value: this.value.toFixed(2)});
          this.max = 1500;
          break;
        case 'Sprinkler':
          this.name = "サブ性能<br>(弱くなるまでの時間延長)";
          this.label = "表示不可";
          break;
        case 'Squid Beakon':
          this.name = "サブ性能<br>(スーパージャンプの時間を短縮)";
          this.label = "表示不可";
          break;
      }
      return (range * 100).toFixed(1);
    }, 150),
    'Super Jump Time (Squid)': new Stat("スーパージャンプの時間 (イカ) *", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Quick Super Jump');
      var mod = this.calcMod(abilityScore)
      var totalFrames = (-1/75)*Math.pow(mod,2) - (84/25)*mod + 218
      this.value = (totalFrames) / 60
      this.label = "{value}秒".format({value: this.value.toFixed(2)});
      return ((totalFrames) / 60).toFixed(2);
    }, 3.65),
    'Super Jump Time (Kid)': new Stat("スーパージャンプの時間 (ヒト) *", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Quick Super Jump');
      var mod = this.calcMod(abilityScore)
      var totalFrames = (-1/75)*Math.pow(mod,2) - (84/25)*mod + 239
      this.value = totalFrames / 60
      this.label = "{value}秒".format({value: this.value.toFixed(2)});
      return (totalFrames / 60).toFixed(2);
    }, 4),
    //TODO: This is WRONG! Need more data on Respawn Punisher!
    'Quick Respawn Time': new Stat("復活時間", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Quick Respawn');
      this.name = "復活時間";
      this.desc = "相手を一人も倒せないまま連続でやられてしまったときの復活時間";
      var death = 30;
      var splatcam = 354;
      var spawn = 120;
      var mod = this.calcMod(abilityScore)/60
      if(loadout.hasAbility('Respawn Punisher')) {
        this.name = "復活時間 *";
        this.desc = "復活ペナルティの効果はまだ調査中。";
        mod *= 0.5;
        splatcam += 74;
      }
      var spawnFrames = death + (splatcam*(1-mod)) + spawn;
      this.value = spawnFrames/60
      this.label = "{value}秒".format({value: this.value.toFixed(2)});
      return this.value.toFixed(2)
    }, 9.6),
    'Tracking Time': new Stat("マーキング時間 *", function(loadout) {
      var abilityScore = loadout.calcAbilityScore('Cold-Blooded');
      var trackReduction = this.calcMod(abilityScore) / 40
      this.value = (8 * (1 - trackReduction))
      this.label = "{value}秒".format({value: this.value.toFixed(2)});
      this.desc = "相手のポイントセンサーなど位置を発見してくる攻撃の効果時間";
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
