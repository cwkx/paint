(function ($) {
  var tool;
  var canvas = $('paint');
  var ctx = canvas.getContext('2d');

  var history = {
    redo_list: [],
    undo_list: [],
    saveState: function (canvas, list, keep_redo) {
      keep_redo = keep_redo || false;
      if (!keep_redo) {
        this.redo_list = [];
      }

      (list || this.undo_list).push(canvas.toDataURL());
    },
    undo: function (canvas, ctx) {
      this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
    },
    redo: function (canvas, ctx) {
      this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
    },
    restoreState: function (canvas, ctx, pop, push) {
      if (pop.length) {
        this.saveState(canvas, push, true);
        var restore_state = pop.pop();
        var img = new Element('img', { 'src': restore_state });
        img.onload = function () {
          ctx.clearRect(0, 0, 64, 64);
          ctx.drawImage(img, 0, 0, 64, 64, 0, 0, 64, 64);
        }
      }
    }
  }

  var pencil = {
    options: {
      stroke_color: ['00', '00', '00'],
      dim: 4,
      x: 0,
      y: 0
    },
    init: function (canvas, ctx) {
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.drawing = false;
      this.addCanvasEvents();
    },
    addCanvasEvents: function () {
      this.canvas.addEvent('mousedown', this.start.bind(this));
      this.canvas.addEvent('mousemove', this.stroke.bind(this));
      this.canvas.addEvent('mouseup', this.stop.bind(this));
      this.canvas.addEvent('mouseout', this.stop.bind(this));
      document.body.addEventListener('keydown', this.start.bind(this));
      document.body.addEventListener('keyup', this.stop.bind(this));
    },
    start: function (evt) {
      if (evt.repeat != true) { 
        var x = this.options.x - this.canvas_coords.left;
        var y = this.options.y - this.canvas_coords.top;
        this.ctx.beginPath();
        this.ctx.moveTo(x/4, y/4);
        history.saveState(this.canvas);
        this.drawing = true;
      }
    },
    stroke: function (evt) {
      this.options.x = evt.page.x;
      this.options.y = evt.page.y;
      if (this.drawing) {
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        this.ctx.lineTo(x/4, y/4);
        this.ctx.stroke();

      }
    },
    stop: function (evt) {
      if (this.drawing) this.drawing = false;
    }
  };

  $('pencil').addEvent('click', function () {
    pencil.init(canvas, ctx);
  });

  $('undo').addEvent('click', function () {
    history.undo(canvas, ctx);
  });

  $('redo').addEvent('click', function () {
    history.redo(canvas, ctx);
  });

})(document.id)