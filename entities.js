var sprites = {
 frog: { sx: 0, sy: 340, w: 39, h: 45, frames: 7 },

 background: {sx: 420, sy: 0, w: 550, h: 625, frames: 1},
 frogger: {sx: 0, sy: 391, w: 286, h: 181, frames: 1},

 car_blue: { sx: 0, sy: 0, w: 103, h: 48, frames: 1 },
 car_green: { sx: 103, sy: 0, w: 104, h: 48, frames: 1 },
 car_yelow: { sx: 209, sy: 0, w: 104, h: 48, frames: 1 },
 car_fire: { sx: 0, sy: 64, w: 139, h: 47, frames: 1 },
 truck: { sx: 150, sy: 64, w: 200, h: 45, frames: 1 },

 trunk_big: {sx:10 , sy:174 , w:248 , h:37 , frames:1  },
 trunk_medium:{sx:10 , sy:125 , w:192 , h:37 , frames:1 },
 trunk_small:{sx: 271, sy:174 , w:130 , h:37 , frames: 1 },

 turtle: {sx:283 , sy:344 , w:50 , h:45 , frames:2 },
 turtleW: {sx: 5, sy: 288, w: 50, h:45 , frames: 8},

 death: {sx:212, sy:127 , w:47 , h:37 , frames: 4}

};

var OBJECT_PLAYER = 1,
    OBJECT_TRUNK = 2,
    OBJECT_CAR = 4,
    OBJECT_WATER = 8,
    OBJECT_WIN = 16,
    OBJECT_TURTLE = 32;


/// CLASE PADRE SPRITE
var Sprite = function()  
 { }

Sprite.prototype.setup = function(sprite,props) {
  this.sprite = sprite;
  this.merge(props);
  this.frame = this.frame || 0;
  this.w =  SpriteSheet.map[sprite].w;
  this.h =  SpriteSheet.map[sprite].h;
}

Sprite.prototype.merge = function(props) {
  if(props) {
    for (var prop in props) {
      this[prop] = props[prop];
    }
  }
}
Sprite.prototype.draw = function(ctx) {
  SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
}

Sprite.prototype.hit = function(damage) {
  this.board.remove(this);
}

//Clase para el Fondo
var Fondo = function() {
  this.setup('background', { vx: 0, vy: 0, frame: 0});
  this.x = 0; 
  this.y = 0;
  this.step = function() {}
}
Fondo.prototype = new Sprite();

//Clase para el logo
var Logo = function() {
  this.setup('frogger', { vx: 0, vy: 0, frame: 0});
  this.x = Game.width / 4;
  this.y = 80;
  this.step = function() {}  
}
Logo.prototype = new Sprite();

// PLAYER 
var PlayerFrog = function() { 

  this.setup('frog', { vx: 0, vy: 0 , frame: 0, reloadTime: 0.25, up_down: 48, l_r: 40 });

   this.x = Game.width/2 - this.w / 2;
   this.y = Game.height +30 - this.h ;

   this.reload = this.reloadTime;

   this.jumpDelay = 0;

   this.subFrame = 0;
   this.salto = false;
}

PlayerFrog.prototype = new Sprite();
PlayerFrog.prototype.type = OBJECT_PLAYER;
PlayerFrog.prototype.step = function(dt) {

  if(this.jumpDelay > 0) {this.jumpDelay -= dt;}

  if(Game.keys['left'] && this.jumpDelay <= 0) { this.x -= this.l_r; this.jumpDelay = 0.2;}
  else if(Game.keys['right'] && this.jumpDelay <= 0) { this.x += this.l_r;this.jumpDelay = 0.2; }
  else if(Game.keys['up'] && this.jumpDelay <= 0) { this.y -= this.up_down;this.jumpDelay = 0.2;}
  else if(Game.keys['down'] && this.jumpDelay <= 0) { this.y += this.up_down;this.jumpDelay = 0.2;}
  else { this.vx = 0; 
         this.vy = 0}

  this.x += this.vx * dt;
  this.y += this.vy * dt;

   if(this.x < 0) { this.x = 0; }
   else if(this.x > Game.width - this.w) { 
     this.x = Game.width - this.w 
   }

    if(this.y < 0) { this.y = 0; }
   else if(this.y > Game.height - this.h) { 
     this.y = Game.height - this.h 
   }

  this.reload-=dt;
  
  var collisionG = this.board.collide(this, OBJECT_WIN);
  var collisionT = this.board.collide(this, OBJECT_TRUNK);
  var collisionTU = this.board.collide(this, OBJECT_TURTLE);
  var collisionW = this.board.collide(this, OBJECT_WATER);
  

  if(collisionG) {
    this.board.remove(this);
    winGame();
  }
  else {
   if(collisionW && !collisionT && !collisionTU) {
      this.board.remove(this);
      this.board.add(new Death(this.x + this.w/2,  this.y + this.h/2));
     
    }
    else if(collisionT) {
        this.onTrunk(collisionT.vx, dt);
    }
    if(collisionTU && !collisionT) {
      this.onTrunk(collisionTU.vx, dt);
    }

  }

  this.frame = Math.floor(this.subFrame++ / 34);
          if(this.subFrame >= 58) {
            this.subFrame = 0;
          };

  this.vx  = 0;

}
PlayerFrog.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    this.board.add(new Death(this.x + this.w/2,  this.y + this.h/2));
  }
}

PlayerFrog.prototype.onTrunk = function(vt, dt) {
  this.x += vt * dt;
}


var cars = {
  blue: {v: 1, x: -100, y: 530, sprite: 'car_blue', vel: 200},
  green: {v: 2, x: -100, y: 338, sprite: 'car_green', vel: 100},
  yelow: {v: 3, x: -100, y: 434, sprite: 'car_yelow', vel: 70},
  red: {v: 4, x: 550, y: 386, sprite: 'car_fire', vel: -300},
  brown: {v: 5, x: 550, y: 482, sprite: 'truck', vel: -100}
}

//Clase Coche
var Car = function(blueprint,override) {
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
}

Car.prototype = new Sprite();

Car.prototype.type = OBJECT_CAR;

Car.prototype.step = function(dt) {
  this.t += dt;
 
  this.vx = this.vel;

 this.x += this.vx * dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

}

var trunks = {
  small: { x: -100, y:49 , sprite: 'trunk_small', vel:180},
  medium: { x: 550 , y:145 , sprite: 'trunk_medium', vel:-100 },
  big: { x: -150, y:241 , sprite: 'trunk_big', vel: 100}
}

//Clase tronco
var Trunk = function(blueprint,override) {
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
}

Trunk.prototype = new Sprite();
Trunk.prototype.type = OBJECT_TRUNK;

Trunk.prototype.step = function(dt) {
  this.t += dt;
  this.vx = this.vel;

 this.x += this.vx * dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
  
}

var turtles = {
  turtle1: { x:-10, y: 96, sprite: 'turtle', vel: 100},
  turtle2: { x:-10, y: 192, sprite: 'turtleW', vel: 180}
}
//Clase tortuga
var Turtles = function(blueprint,override) {
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
}

Turtles.prototype = new Sprite();
Turtles.prototype.type = OBJECT_TURTLE;

Turtles.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.vel;

 this.x += this.vx * dt;
 
  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
}

//Se encarga de la creación de los coches
var creaCoches = function() {
  this.coches = [{c: cars.blue, f: 4, t: 4},{c: cars.yelow, f: 5, t: 5},{c: cars.green, f: 4, t:4},{c: cars.red, f: 4, t:4},{c: cars.brown, f:5,t:5} ];
}

creaCoches.prototype.draw = function() {}

creaCoches.prototype.step = function(dt) {
  for(let i = 0; i < this.coches.length ;i++) {
    this.coches[i].t += dt
    if(this.coches[i].t >= this.coches[i].f) {
      this.board.add(new Car(this.coches[i].c));
      this.coches[i].t = 0;
    }
  }
}

//Se encarga de la creación de los troncos y tortugas
var creaTroncosyTurtles = function() {
  this.troncos = [{c: trunks.small, f: 2, t: 2},{c: trunks.medium,f: 4, t: 4},{c: trunks.big, f: 5, t: 5}];
  this.turtles = [ {c: turtles.turtle1, f: 2, t: 2}, {c: turtles.turtle2, f: 1, t: 1}];
}

creaTroncosyTurtles.prototype.draw = function() {}

creaTroncosyTurtles.prototype.step = function(dt) {

  for(let j = 0; j < this.troncos.length; j++) {
    this.troncos[j].t += dt
    if(this.troncos[j].t >= this.troncos[j].f) {
      this.board.add(new Trunk(this.troncos[j].c));
      this.troncos[j].t = 0;
    }
  }
  for(let i = 0; i < this.turtles.length; i++) {
    this.turtles[i].t += dt
    if(this.turtles[i].t >= this.turtles[i].f) {
      this.board.add(new Turtles(this.turtles[i].c));
      this.turtles[i].t = 0;
    }
  }
}

var Water = function() {
      this.x = 0;
      this.y = 50;
      this.h = 241;
      this.w = 550;
}

Water.prototype = new Sprite();
Water.prototype.type = OBJECT_WATER;
Water.prototype.step = function () {}
Water.prototype.draw = function() {}


var Death = function(centerX,centerY) {
  this.setup('death', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
   this.subFrame = 0;
};

Death.prototype = new Sprite();

Death.prototype.step = function(dt) {
  this.frame = Math.floor(this.subFrame++ / 8);
  if(this.subFrame >= 26) {
    this.board.remove(this);
    loseGame();
  }
};

var Home = function () {
      this.x = 0;
      this.y = 0;
      this.h = 48;
      this.w = 550;
    }

    Home.prototype = new Sprite();
    Home.prototype.type = OBJECT_WIN;
    Home.prototype.step = function () {};
    Home.prototype.draw = function () {};