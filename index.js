var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

"floor|ceil|random|round|abs|sqrt|PI|atan2|sin|cos|pow|max|min"
  .split("|")
  .forEach(function(p) {
    window[p] = Math[p];
  });

var TAU = PI * 2;

function r(n) {
  return random() * n;
}
function rrng(lo, hi) {
  return lo + r(hi - lo);
}
function rint(lo, hi) {
  return lo + floor(r(hi - lo + 1));
}
function choose(args) {
  return args[rint(0, args.length - 1)];
}

/*---------------------------------------------------------------------------*/

var W, H, frame, t0, time;
var DPR = devicePixelRatio;

function dpr(n) {
  return n * DPR;
}

function resize() {
  var w = innerWidth;
  var h = innerHeight;

  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  W = canvas.width = w * DPR;
  H = canvas.height = h * DPR;
}

function loop(t) {
  frame = requestAnimationFrame(loop);
  draw();
  time++;
}

function pause() {
  cancelAnimationFrame(frame);
  frame = frame ? null : requestAnimationFrame(loop);
}

function reset() {
  cancelAnimationFrame(frame);
  resize();
  ctx.clearRect(0, 0, W, H);
  init();
  time = 0;
  frame = requestAnimationFrame(loop);
}

/*---------------------------------------------------------------------------*/

function Neuron(i, x, y, n) {
  this.i = i;
  this.x = x;
  this.y = y;
  this.n = n;
  this.indices = [];
}

Neuron.prototype.distanceTo = function(other) {
  var dx = this.x - other.x;
  var dy = this.y - other.y;
  return sqrt(dx * dx + dy * dy);
};

Neuron.prototype.setWeights = function(neurons) {
  var d, w, i;

  for (i = 0; i < neurons.length; i++) {
    d = this.distanceTo(neurons[i]);
    w = d < STEP && d > 0.1 ? ceil(STEP / d) : 0;
    while (w--) this.indices.push(i);
  }
};

Neuron.prototype.draw = function() {
  if (this.n <= 0) return;
  ctx.beginPath();
  ctx.arc(this.x, this.y, dpr(this.n) / 2, 0, TAU);
  ctx.fill();
};

Neuron.prototype.connect = function() {
  if (this.n <= 0 || this.indices.length === 0) return;

  var i;
  do {
    i = choose(this.indices);
  } while (this.i === i);
  var other = Neurons[i];

  ctx.moveTo(this.x, this.y);
  ctx.lineTo(other.x, other.y);

  this.n--;
  other.n++;
};

/*---------------------------------------------------------------------------*/

var Neurons;
var STEP;
var NN = 1500;

function clear() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, W, H);
}

function init() {
  var i, j;
  Neurons = new Array(NN);
  STEP = min(W, H) / 20;

  for (i = 0; i < NN; i++) {
    Neurons[i] = new Neuron(i, r(W), r(H), 1);
  }

  for (i = 0; i < NN; i++) {
    n = Neurons[i];
    n.setWeights(Neurons);
  }

  clear();
}
let done1 = false;
let done2 = 0;
function draw() {
  var i;

  if (time % 5 === 0 && !done1) {
    ctx.fillStyle = "rgba(225,205,205, 0.125)";
    ctx.strokeStyle = "rgba(0,0,0, 0.0225)";

    for (i = 0; i < NN; i++) {
      Neurons[i].draw();
    }

    ctx.beginPath();
    for (i = 0; i < NN; i++) {
      Neurons[i].connect();
    }
    ctx.stroke();
  }

  if (time % 300 === 0) {
    if (done2 < 1) {
      pause();
      reset();
      done2++;
    } else {
      done1 = true;
    }
  }
}

/*---------------------------------------------------------------------------*/

document.onclick = pause;
document.ondblclick = reset;

reset();
