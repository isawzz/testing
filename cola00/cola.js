(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cola = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	"use strict";
	function __export(m) {
			for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(require("./src/adaptor"));
	__export(require("./src/d3adaptor"));
	__export(require("./src/descent"));
	__export(require("./src/geom"));
	__export(require("./src/gridrouter"));
	__export(require("./src/handledisconnected"));
	__export(require("./src/layout"));
	__export(require("./src/layout3d"));
	__export(require("./src/linklengths"));
	__export(require("./src/powergraph"));
	__export(require("./src/pqueue"));
	__export(require("./src/rbtree"));
	__export(require("./src/rectangle"));
	__export(require("./src/shortestpaths"));
	__export(require("./src/vpsc"));
	__export(require("./src/batch"));
	
	},{"./src/adaptor":2,"./src/batch":3,"./src/d3adaptor":4,"./src/descent":7,"./src/geom":8,"./src/gridrouter":9,"./src/handledisconnected":10,"./src/layout":11,"./src/layout3d":12,"./src/linklengths":13,"./src/powergraph":14,"./src/pqueue":15,"./src/rbtree":16,"./src/rectangle":17,"./src/shortestpaths":18,"./src/vpsc":19}],2:[function(require,module,exports){
	"use strict";
	var __extends = (this && this.__extends) || (function () {
			var extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
			return function (d, b) {
					extendStatics(d, b);
					function __() { this.constructor = d; }
					d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var layout_1 = require("./layout");
	var LayoutAdaptor = (function (_super) {
			__extends(LayoutAdaptor, _super);
			function LayoutAdaptor(options) {
					var _this = _super.call(this) || this;
					var self = _this;
					var o = options;
					if (o.trigger) {
							_this.trigger = o.trigger;
					}
					if (o.kick) {
							_this.kick = o.kick;
					}
					if (o.drag) {
							_this.drag = o.drag;
					}
					if (o.on) {
							_this.on = o.on;
					}
					_this.dragstart = _this.dragStart = layout_1.Layout.dragStart;
					_this.dragend = _this.dragEnd = layout_1.Layout.dragEnd;
					return _this;
			}
			LayoutAdaptor.prototype.trigger = function (e) { };
			;
			LayoutAdaptor.prototype.kick = function () { };
			;
			LayoutAdaptor.prototype.drag = function () { };
			;
			LayoutAdaptor.prototype.on = function (eventType, listener) { return this; };
			;
			return LayoutAdaptor;
	}(layout_1.Layout));
	exports.LayoutAdaptor = LayoutAdaptor;
	function adaptor(options) {
			return new LayoutAdaptor(options);
	}
	exports.adaptor = adaptor;
	
	},{"./layout":11}],3:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var layout_1 = require("./layout");
	var gridrouter_1 = require("./gridrouter");
	function gridify(pgLayout, nudgeGap, margin, groupMargin) {
			pgLayout.cola.start(0, 0, 0, 10, false);
			var gridrouter = route(pgLayout.cola.nodes(), pgLayout.cola.groups(), margin, groupMargin);
			return gridrouter.routeEdges(pgLayout.powerGraph.powerEdges, nudgeGap, function (e) { return e.source.routerNode.id; }, function (e) { return e.target.routerNode.id; });
	}
	exports.gridify = gridify;
	function route(nodes, groups, margin, groupMargin) {
			nodes.forEach(function (d) {
					d.routerNode = {
							name: d.name,
							bounds: d.bounds.inflate(-margin)
					};
			});
			groups.forEach(function (d) {
					d.routerNode = {
							bounds: d.bounds.inflate(-groupMargin),
							children: (typeof d.groups !== 'undefined' ? d.groups.map(function (c) { return nodes.length + c.id; }) : [])
									.concat(typeof d.leaves !== 'undefined' ? d.leaves.map(function (c) { return c.index; }) : [])
					};
			});
			var gridRouterNodes = nodes.concat(groups).map(function (d, i) {
					d.routerNode.id = i;
					return d.routerNode;
			});
			return new gridrouter_1.GridRouter(gridRouterNodes, {
					getChildren: function (v) { return v.children; },
					getBounds: function (v) { return v.bounds; }
			}, margin - groupMargin);
	}
	function powerGraphGridLayout(graph, size, grouppadding) {
			var powerGraph;
			graph.nodes.forEach(function (v, i) { return v.index = i; });
			new layout_1.Layout()
					.avoidOverlaps(false)
					.nodes(graph.nodes)
					.links(graph.links)
					.powerGraphGroups(function (d) {
					powerGraph = d;
					powerGraph.groups.forEach(function (v) { return v.padding = grouppadding; });
			});
			var n = graph.nodes.length;
			var edges = [];
			var vs = graph.nodes.slice(0);
			vs.forEach(function (v, i) { return v.index = i; });
			powerGraph.groups.forEach(function (g) {
					var sourceInd = g.index = g.id + n;
					vs.push(g);
					if (typeof g.leaves !== 'undefined')
							g.leaves.forEach(function (v) { return edges.push({ source: sourceInd, target: v.index }); });
					if (typeof g.groups !== 'undefined')
							g.groups.forEach(function (gg) { return edges.push({ source: sourceInd, target: gg.id + n }); });
			});
			powerGraph.powerEdges.forEach(function (e) {
					edges.push({ source: e.source.index, target: e.target.index });
			});
			new layout_1.Layout()
					.size(size)
					.nodes(vs)
					.links(edges)
					.avoidOverlaps(false)
					.linkDistance(30)
					.symmetricDiffLinkLengths(5)
					.convergenceThreshold(1e-4)
					.start(100, 0, 0, 0, false);
			return {
					cola: new layout_1.Layout()
							.convergenceThreshold(1e-3)
							.size(size)
							.avoidOverlaps(true)
							.nodes(graph.nodes)
							.links(graph.links)
							.groupCompactness(1e-4)
							.linkDistance(30)
							.symmetricDiffLinkLengths(5)
							.powerGraphGroups(function (d) {
							powerGraph = d;
							powerGraph.groups.forEach(function (v) {
									v.padding = grouppadding;
							});
					}).start(50, 0, 100, 0, false),
					powerGraph: powerGraph
			};
	}
	exports.powerGraphGridLayout = powerGraphGridLayout;
	
	},{"./gridrouter":9,"./layout":11}],4:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var d3v3 = require("./d3v3adaptor");
	var d3v4 = require("./d3v4adaptor");
	;
	function d3adaptor(d3Context) {
			if (!d3Context || isD3V3(d3Context)) {
					return new d3v3.D3StyleLayoutAdaptor();
			}
			return new d3v4.D3StyleLayoutAdaptor(d3Context);
	}
	exports.d3adaptor = d3adaptor;
	function isD3V3(d3Context) {
			var v3exp = /^3\./;
			return d3Context.version && d3Context.version.match(v3exp) !== null;
	}
	
	},{"./d3v3adaptor":5,"./d3v4adaptor":6}],5:[function(require,module,exports){
	"use strict";
	var __extends = (this && this.__extends) || (function () {
			var extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
			return function (d, b) {
					extendStatics(d, b);
					function __() { this.constructor = d; }
					d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var layout_1 = require("./layout");
	var D3StyleLayoutAdaptor = (function (_super) {
			__extends(D3StyleLayoutAdaptor, _super);
			function D3StyleLayoutAdaptor() {
					var _this = _super.call(this) || this;
					_this.event = d3.dispatch(layout_1.EventType[layout_1.EventType.start], layout_1.EventType[layout_1.EventType.tick], layout_1.EventType[layout_1.EventType.end]);
					var d3layout = _this;
					var drag;
					_this.drag = function () {
							if (!drag) {
									var drag = d3.behavior.drag()
											.origin(layout_1.Layout.dragOrigin)
											.on("dragstart.d3adaptor", layout_1.Layout.dragStart)
											.on("drag.d3adaptor", function (d) {
											layout_1.Layout.drag(d, d3.event);
											d3layout.resume();
									})
											.on("dragend.d3adaptor", layout_1.Layout.dragEnd);
							}
							if (!arguments.length)
									return drag;
							this
									.call(drag);
					};
					return _this;
			}
			D3StyleLayoutAdaptor.prototype.trigger = function (e) {
					var d3event = { type: layout_1.EventType[e.type], alpha: e.alpha, stress: e.stress };
					this.event[d3event.type](d3event);
			};
			D3StyleLayoutAdaptor.prototype.kick = function () {
					var _this = this;
					d3.timer(function () { return _super.prototype.tick.call(_this); });
			};
			D3StyleLayoutAdaptor.prototype.on = function (eventType, listener) {
					if (typeof eventType === 'string') {
							this.event.on(eventType, listener);
					}
					else {
							this.event.on(layout_1.EventType[eventType], listener);
					}
					return this;
			};
			return D3StyleLayoutAdaptor;
	}(layout_1.Layout));
	exports.D3StyleLayoutAdaptor = D3StyleLayoutAdaptor;
	function d3adaptor() {
			return new D3StyleLayoutAdaptor();
	}
	exports.d3adaptor = d3adaptor;
	
	},{"./layout":11}],6:[function(require,module,exports){
	"use strict";
	var __extends = (this && this.__extends) || (function () {
			var extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
			return function (d, b) {
					extendStatics(d, b);
					function __() { this.constructor = d; }
					d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var layout_1 = require("./layout");
	var D3StyleLayoutAdaptor = (function (_super) {
			__extends(D3StyleLayoutAdaptor, _super);
			function D3StyleLayoutAdaptor(d3Context) {
					var _this = _super.call(this) || this;
					_this.d3Context = d3Context;
					_this.event = d3Context.dispatch(layout_1.EventType[layout_1.EventType.start], layout_1.EventType[layout_1.EventType.tick], layout_1.EventType[layout_1.EventType.end]);
					var d3layout = _this;
					var drag;
					_this.drag = function () {
							if (!drag) {
									var drag = d3Context.drag()
											.subject(layout_1.Layout.dragOrigin)
											.on("start.d3adaptor", layout_1.Layout.dragStart)
											.on("drag.d3adaptor", function (d) {
											layout_1.Layout.drag(d, d3Context.event);
											d3layout.resume();
									})
											.on("end.d3adaptor", layout_1.Layout.dragEnd);
							}
							if (!arguments.length)
									return drag;
							arguments[0].call(drag);
					};
					return _this;
			}
			D3StyleLayoutAdaptor.prototype.trigger = function (e) {
					var d3event = { type: layout_1.EventType[e.type], alpha: e.alpha, stress: e.stress };
					this.event.call(d3event.type, d3event);
			};
			D3StyleLayoutAdaptor.prototype.kick = function () {
					var _this = this;
					var t = this.d3Context.timer(function () { return _super.prototype.tick.call(_this) && t.stop(); });
			};
			D3StyleLayoutAdaptor.prototype.on = function (eventType, listener) {
					if (typeof eventType === 'string') {
							this.event.on(eventType, listener);
					}
					else {
							this.event.on(layout_1.EventType[eventType], listener);
					}
					return this;
			};
			return D3StyleLayoutAdaptor;
	}(layout_1.Layout));
	exports.D3StyleLayoutAdaptor = D3StyleLayoutAdaptor;
	
	},{"./layout":11}],7:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var Locks = (function () {
			function Locks() {
					this.locks = {};
			}
			Locks.prototype.add = function (id, x) {
					this.locks[id] = x;
			};
			Locks.prototype.clear = function () {
					this.locks = {};
			};
			Locks.prototype.isEmpty = function () {
					for (var l in this.locks)
							return false;
					return true;
			};
			Locks.prototype.apply = function (f) {
					for (var l in this.locks) {
							f(Number(l), this.locks[l]);
					}
			};
			return Locks;
	}());
	exports.Locks = Locks;
	var Descent = (function () {
			function Descent(x, D, G) {
					if (G === void 0) { G = null; }
					this.D = D;
					this.G = G;
					this.threshold = 0.0001;
					this.numGridSnapNodes = 0;
					this.snapGridSize = 100;
					this.snapStrength = 1000;
					this.scaleSnapByMaxH = false;
					this.random = new PseudoRandom();
					this.project = null;
					this.x = x;
					this.k = x.length;
					var n = this.n = x[0].length;
					this.H = new Array(this.k);
					this.g = new Array(this.k);
					this.Hd = new Array(this.k);
					this.a = new Array(this.k);
					this.b = new Array(this.k);
					this.c = new Array(this.k);
					this.d = new Array(this.k);
					this.e = new Array(this.k);
					this.ia = new Array(this.k);
					this.ib = new Array(this.k);
					this.xtmp = new Array(this.k);
					this.locks = new Locks();
					this.minD = Number.MAX_VALUE;
					var i = n, j;
					while (i--) {
							j = n;
							while (--j > i) {
									var d = D[i][j];
									if (d > 0 && d < this.minD) {
											this.minD = d;
									}
							}
					}
					if (this.minD === Number.MAX_VALUE)
							this.minD = 1;
					i = this.k;
					while (i--) {
							this.g[i] = new Array(n);
							this.H[i] = new Array(n);
							j = n;
							while (j--) {
									this.H[i][j] = new Array(n);
							}
							this.Hd[i] = new Array(n);
							this.a[i] = new Array(n);
							this.b[i] = new Array(n);
							this.c[i] = new Array(n);
							this.d[i] = new Array(n);
							this.e[i] = new Array(n);
							this.ia[i] = new Array(n);
							this.ib[i] = new Array(n);
							this.xtmp[i] = new Array(n);
					}
			}
			Descent.createSquareMatrix = function (n, f) {
					var M = new Array(n);
					for (var i = 0; i < n; ++i) {
							M[i] = new Array(n);
							for (var j = 0; j < n; ++j) {
									M[i][j] = f(i, j);
							}
					}
					return M;
			};
			Descent.prototype.offsetDir = function () {
					var _this = this;
					var u = new Array(this.k);
					var l = 0;
					for (var i = 0; i < this.k; ++i) {
							var x = u[i] = this.random.getNextBetween(0.01, 1) - 0.5;
							l += x * x;
					}
					l = Math.sqrt(l);
					return u.map(function (x) { return x *= _this.minD / l; });
			};
			Descent.prototype.computeDerivatives = function (x) {
					var _this = this;
					var n = this.n;
					if (n < 1)
							return;
					var i;
					var d = new Array(this.k);
					var d2 = new Array(this.k);
					var Huu = new Array(this.k);
					var maxH = 0;
					for (var u = 0; u < n; ++u) {
							for (i = 0; i < this.k; ++i)
									Huu[i] = this.g[i][u] = 0;
							for (var v = 0; v < n; ++v) {
									if (u === v)
											continue;
									var maxDisplaces = n;
									while (maxDisplaces--) {
											var sd2 = 0;
											for (i = 0; i < this.k; ++i) {
													var dx = d[i] = x[i][u] - x[i][v];
													sd2 += d2[i] = dx * dx;
											}
											if (sd2 > 1e-9)
													break;
											var rd = this.offsetDir();
											for (i = 0; i < this.k; ++i)
													x[i][v] += rd[i];
									}
									var l = Math.sqrt(sd2);
									var D = this.D[u][v];
									var weight = this.G != null ? this.G[u][v] : 1;
									if (weight > 1 && l > D || !isFinite(D)) {
											for (i = 0; i < this.k; ++i)
													this.H[i][u][v] = 0;
											continue;
									}
									if (weight > 1) {
											weight = 1;
									}
									var D2 = D * D;
									var gs = 2 * weight * (l - D) / (D2 * l);
									var l3 = l * l * l;
									var hs = 2 * -weight / (D2 * l3);
									if (!isFinite(gs))
											console.log(gs);
									for (i = 0; i < this.k; ++i) {
											this.g[i][u] += d[i] * gs;
											Huu[i] -= this.H[i][u][v] = hs * (l3 + D * (d2[i] - sd2) + l * sd2);
									}
							}
							for (i = 0; i < this.k; ++i)
									maxH = Math.max(maxH, this.H[i][u][u] = Huu[i]);
					}
					var r = this.snapGridSize / 2;
					var g = this.snapGridSize;
					var w = this.snapStrength;
					var k = w / (r * r);
					var numNodes = this.numGridSnapNodes;
					for (var u = 0; u < numNodes; ++u) {
							for (i = 0; i < this.k; ++i) {
									var xiu = this.x[i][u];
									var m = xiu / g;
									var f = m % 1;
									var q = m - f;
									var a = Math.abs(f);
									var dx = (a <= 0.5) ? xiu - q * g :
											(xiu > 0) ? xiu - (q + 1) * g : xiu - (q - 1) * g;
									if (-r < dx && dx <= r) {
											if (this.scaleSnapByMaxH) {
													this.g[i][u] += maxH * k * dx;
													this.H[i][u][u] += maxH * k;
											}
											else {
													this.g[i][u] += k * dx;
													this.H[i][u][u] += k;
											}
									}
							}
					}
					if (!this.locks.isEmpty()) {
							this.locks.apply(function (u, p) {
									for (i = 0; i < _this.k; ++i) {
											_this.H[i][u][u] += maxH;
											_this.g[i][u] -= maxH * (p[i] - x[i][u]);
									}
							});
					}
			};
			Descent.dotProd = function (a, b) {
					var x = 0, i = a.length;
					while (i--)
							x += a[i] * b[i];
					return x;
			};
			Descent.rightMultiply = function (m, v, r) {
					var i = m.length;
					while (i--)
							r[i] = Descent.dotProd(m[i], v);
			};
			Descent.prototype.computeStepSize = function (d) {
					var numerator = 0, denominator = 0;
					for (var i = 0; i < this.k; ++i) {
							numerator += Descent.dotProd(this.g[i], d[i]);
							Descent.rightMultiply(this.H[i], d[i], this.Hd[i]);
							denominator += Descent.dotProd(d[i], this.Hd[i]);
					}
					if (denominator === 0 || !isFinite(denominator))
							return 0;
					return 1 * numerator / denominator;
			};
			Descent.prototype.reduceStress = function () {
					this.computeDerivatives(this.x);
					var alpha = this.computeStepSize(this.g);
					for (var i = 0; i < this.k; ++i) {
							this.takeDescentStep(this.x[i], this.g[i], alpha);
					}
					return this.computeStress();
			};
			Descent.copy = function (a, b) {
					var m = a.length, n = b[0].length;
					for (var i = 0; i < m; ++i) {
							for (var j = 0; j < n; ++j) {
									b[i][j] = a[i][j];
							}
					}
			};
			Descent.prototype.stepAndProject = function (x0, r, d, stepSize) {
					Descent.copy(x0, r);
					this.takeDescentStep(r[0], d[0], stepSize);
					if (this.project)
							this.project[0](x0[0], x0[1], r[0]);
					this.takeDescentStep(r[1], d[1], stepSize);
					if (this.project)
							this.project[1](r[0], x0[1], r[1]);
					for (var i = 2; i < this.k; i++)
							this.takeDescentStep(r[i], d[i], stepSize);
			};
			Descent.mApply = function (m, n, f) {
					var i = m;
					while (i-- > 0) {
							var j = n;
							while (j-- > 0)
									f(i, j);
					}
			};
			Descent.prototype.matrixApply = function (f) {
					Descent.mApply(this.k, this.n, f);
			};
			Descent.prototype.computeNextPosition = function (x0, r) {
					var _this = this;
					this.computeDerivatives(x0);
					var alpha = this.computeStepSize(this.g);
					this.stepAndProject(x0, r, this.g, alpha);
					if (this.project) {
							this.matrixApply(function (i, j) { return _this.e[i][j] = x0[i][j] - r[i][j]; });
							var beta = this.computeStepSize(this.e);
							beta = Math.max(0.2, Math.min(beta, 1));
							this.stepAndProject(x0, r, this.e, beta);
					}
			};
			Descent.prototype.run = function (iterations) {
					var stress = Number.MAX_VALUE, converged = false;
					while (!converged && iterations-- > 0) {
							var s = this.rungeKutta();
							converged = Math.abs(stress / s - 1) < this.threshold;
							stress = s;
					}
					return stress;
			};
			Descent.prototype.rungeKutta = function () {
					var _this = this;
					this.computeNextPosition(this.x, this.a);
					Descent.mid(this.x, this.a, this.ia);
					this.computeNextPosition(this.ia, this.b);
					Descent.mid(this.x, this.b, this.ib);
					this.computeNextPosition(this.ib, this.c);
					this.computeNextPosition(this.c, this.d);
					var disp = 0;
					this.matrixApply(function (i, j) {
							var x = (_this.a[i][j] + 2.0 * _this.b[i][j] + 2.0 * _this.c[i][j] + _this.d[i][j]) / 6.0, d = _this.x[i][j] - x;
							disp += d * d;
							_this.x[i][j] = x;
					});
					return disp;
			};
			Descent.mid = function (a, b, m) {
					Descent.mApply(a.length, a[0].length, function (i, j) {
							return m[i][j] = a[i][j] + (b[i][j] - a[i][j]) / 2.0;
					});
			};
			Descent.prototype.takeDescentStep = function (x, d, stepSize) {
					for (var i = 0; i < this.n; ++i) {
							x[i] = x[i] - stepSize * d[i];
					}
			};
			Descent.prototype.computeStress = function () {
					var stress = 0;
					for (var u = 0, nMinus1 = this.n - 1; u < nMinus1; ++u) {
							for (var v = u + 1, n = this.n; v < n; ++v) {
									var l = 0;
									for (var i = 0; i < this.k; ++i) {
											var dx = this.x[i][u] - this.x[i][v];
											l += dx * dx;
									}
									l = Math.sqrt(l);
									var d = this.D[u][v];
									if (!isFinite(d))
											continue;
									var rl = d - l;
									var d2 = d * d;
									stress += rl * rl / d2;
							}
					}
					return stress;
			};
			return Descent;
	}());
	Descent.zeroDistance = 1e-10;
	exports.Descent = Descent;
	var PseudoRandom = (function () {
			function PseudoRandom(seed) {
					if (seed === void 0) { seed = 1; }
					this.seed = seed;
					this.a = 214013;
					this.c = 2531011;
					this.m = 2147483648;
					this.range = 32767;
			}
			PseudoRandom.prototype.getNext = function () {
					this.seed = (this.seed * this.a + this.c) % this.m;
					return (this.seed >> 16) / this.range;
			};
			PseudoRandom.prototype.getNextBetween = function (min, max) {
					return min + this.getNext() * (max - min);
			};
			return PseudoRandom;
	}());
	exports.PseudoRandom = PseudoRandom;
	
	},{}],8:[function(require,module,exports){
	"use strict";
	var __extends = (this && this.__extends) || (function () {
			var extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
			return function (d, b) {
					extendStatics(d, b);
					function __() { this.constructor = d; }
					d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var rectangle_1 = require("./rectangle");
	var Point = (function () {
			function Point() {
			}
			return Point;
	}());
	exports.Point = Point;
	var LineSegment = (function () {
			function LineSegment(x1, y1, x2, y2) {
					this.x1 = x1;
					this.y1 = y1;
					this.x2 = x2;
					this.y2 = y2;
			}
			return LineSegment;
	}());
	exports.LineSegment = LineSegment;
	var PolyPoint = (function (_super) {
			__extends(PolyPoint, _super);
			function PolyPoint() {
					return _super !== null && _super.apply(this, arguments) || this;
			}
			return PolyPoint;
	}(Point));
	exports.PolyPoint = PolyPoint;
	function isLeft(P0, P1, P2) {
			return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y);
	}
	exports.isLeft = isLeft;
	function above(p, vi, vj) {
			return isLeft(p, vi, vj) > 0;
	}
	function below(p, vi, vj) {
			return isLeft(p, vi, vj) < 0;
	}
	function ConvexHull(S) {
			var P = S.slice(0).sort(function (a, b) { return a.x !== b.x ? b.x - a.x : b.y - a.y; });
			var n = S.length, i;
			var minmin = 0;
			var xmin = P[0].x;
			for (i = 1; i < n; ++i) {
					if (P[i].x !== xmin)
							break;
			}
			var minmax = i - 1;
			var H = [];
			H.push(P[minmin]);
			if (minmax === n - 1) {
					if (P[minmax].y !== P[minmin].y)
							H.push(P[minmax]);
			}
			else {
					var maxmin, maxmax = n - 1;
					var xmax = P[n - 1].x;
					for (i = n - 2; i >= 0; i--)
							if (P[i].x !== xmax)
									break;
					maxmin = i + 1;
					i = minmax;
					while (++i <= maxmin) {
							if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
									continue;
							while (H.length > 1) {
									if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
											break;
									else
											H.length -= 1;
							}
							if (i != minmin)
									H.push(P[i]);
					}
					if (maxmax != maxmin)
							H.push(P[maxmax]);
					var bot = H.length;
					i = maxmin;
					while (--i >= minmax) {
							if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
									continue;
							while (H.length > bot) {
									if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
											break;
									else
											H.length -= 1;
							}
							if (i != minmin)
									H.push(P[i]);
					}
			}
			return H;
	}
	exports.ConvexHull = ConvexHull;
	function clockwiseRadialSweep(p, P, f) {
			P.slice(0).sort(function (a, b) { return Math.atan2(a.y - p.y, a.x - p.x) - Math.atan2(b.y - p.y, b.x - p.x); }).forEach(f);
	}
	exports.clockwiseRadialSweep = clockwiseRadialSweep;
	function nextPolyPoint(p, ps) {
			if (p.polyIndex === ps.length - 1)
					return ps[0];
			return ps[p.polyIndex + 1];
	}
	function prevPolyPoint(p, ps) {
			if (p.polyIndex === 0)
					return ps[ps.length - 1];
			return ps[p.polyIndex - 1];
	}
	function tangent_PointPolyC(P, V) {
			return { rtan: Rtangent_PointPolyC(P, V), ltan: Ltangent_PointPolyC(P, V) };
	}
	function Rtangent_PointPolyC(P, V) {
			var n = V.length - 1;
			var a, b, c;
			var upA, dnC;
			if (below(P, V[1], V[0]) && !above(P, V[n - 1], V[0]))
					return 0;
			for (a = 0, b = n;;) {
					if (b - a === 1)
							if (above(P, V[a], V[b]))
									return a;
							else
									return b;
					c = Math.floor((a + b) / 2);
					dnC = below(P, V[c + 1], V[c]);
					if (dnC && !above(P, V[c - 1], V[c]))
							return c;
					upA = above(P, V[a + 1], V[a]);
					if (upA) {
							if (dnC)
									b = c;
							else {
									if (above(P, V[a], V[c]))
											b = c;
									else
											a = c;
							}
					}
					else {
							if (!dnC)
									a = c;
							else {
									if (below(P, V[a], V[c]))
											b = c;
									else
											a = c;
							}
					}
			}
	}
	function Ltangent_PointPolyC(P, V) {
			var n = V.length - 1;
			var a, b, c;
			var dnA, dnC;
			if (above(P, V[n - 1], V[0]) && !below(P, V[1], V[0]))
					return 0;
			for (a = 0, b = n;;) {
					if (b - a === 1)
							if (below(P, V[a], V[b]))
									return a;
							else
									return b;
					c = Math.floor((a + b) / 2);
					dnC = below(P, V[c + 1], V[c]);
					if (above(P, V[c - 1], V[c]) && !dnC)
							return c;
					dnA = below(P, V[a + 1], V[a]);
					if (dnA) {
							if (!dnC)
									b = c;
							else {
									if (below(P, V[a], V[c]))
											b = c;
									else
											a = c;
							}
					}
					else {
							if (dnC)
									a = c;
							else {
									if (above(P, V[a], V[c]))
											b = c;
									else
											a = c;
							}
					}
			}
	}
	function tangent_PolyPolyC(V, W, t1, t2, cmp1, cmp2) {
			var ix1, ix2;
			ix1 = t1(W[0], V);
			ix2 = t2(V[ix1], W);
			var done = false;
			while (!done) {
					done = true;
					while (true) {
							if (ix1 === V.length - 1)
									ix1 = 0;
							if (cmp1(W[ix2], V[ix1], V[ix1 + 1]))
									break;
							++ix1;
					}
					while (true) {
							if (ix2 === 0)
									ix2 = W.length - 1;
							if (cmp2(V[ix1], W[ix2], W[ix2 - 1]))
									break;
							--ix2;
							done = false;
					}
			}
			return { t1: ix1, t2: ix2 };
	}
	exports.tangent_PolyPolyC = tangent_PolyPolyC;
	function LRtangent_PolyPolyC(V, W) {
			var rl = RLtangent_PolyPolyC(W, V);
			return { t1: rl.t2, t2: rl.t1 };
	}
	exports.LRtangent_PolyPolyC = LRtangent_PolyPolyC;
	function RLtangent_PolyPolyC(V, W) {
			return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Ltangent_PointPolyC, above, below);
	}
	exports.RLtangent_PolyPolyC = RLtangent_PolyPolyC;
	function LLtangent_PolyPolyC(V, W) {
			return tangent_PolyPolyC(V, W, Ltangent_PointPolyC, Ltangent_PointPolyC, below, below);
	}
	exports.LLtangent_PolyPolyC = LLtangent_PolyPolyC;
	function RRtangent_PolyPolyC(V, W) {
			return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Rtangent_PointPolyC, above, above);
	}
	exports.RRtangent_PolyPolyC = RRtangent_PolyPolyC;
	var BiTangent = (function () {
			function BiTangent(t1, t2) {
					this.t1 = t1;
					this.t2 = t2;
			}
			return BiTangent;
	}());
	exports.BiTangent = BiTangent;
	var BiTangents = (function () {
			function BiTangents() {
			}
			return BiTangents;
	}());
	exports.BiTangents = BiTangents;
	var TVGPoint = (function (_super) {
			__extends(TVGPoint, _super);
			function TVGPoint() {
					return _super !== null && _super.apply(this, arguments) || this;
			}
			return TVGPoint;
	}(Point));
	exports.TVGPoint = TVGPoint;
	var VisibilityVertex = (function () {
			function VisibilityVertex(id, polyid, polyvertid, p) {
					this.id = id;
					this.polyid = polyid;
					this.polyvertid = polyvertid;
					this.p = p;
					p.vv = this;
			}
			return VisibilityVertex;
	}());
	exports.VisibilityVertex = VisibilityVertex;
	var VisibilityEdge = (function () {
			function VisibilityEdge(source, target) {
					this.source = source;
					this.target = target;
			}
			VisibilityEdge.prototype.length = function () {
					var dx = this.source.p.x - this.target.p.x;
					var dy = this.source.p.y - this.target.p.y;
					return Math.sqrt(dx * dx + dy * dy);
			};
			return VisibilityEdge;
	}());
	exports.VisibilityEdge = VisibilityEdge;
	var TangentVisibilityGraph = (function () {
			function TangentVisibilityGraph(P, g0) {
					this.P = P;
					this.V = [];
					this.E = [];
					if (!g0) {
							var n = P.length;
							for (var i = 0; i < n; i++) {
									var p = P[i];
									for (var j = 0; j < p.length; ++j) {
											var pj = p[j], vv = new VisibilityVertex(this.V.length, i, j, pj);
											this.V.push(vv);
											if (j > 0)
													this.E.push(new VisibilityEdge(p[j - 1].vv, vv));
									}
							}
							for (var i = 0; i < n - 1; i++) {
									var Pi = P[i];
									for (var j = i + 1; j < n; j++) {
											var Pj = P[j], t = tangents(Pi, Pj);
											for (var q in t) {
													var c = t[q], source = Pi[c.t1], target = Pj[c.t2];
													this.addEdgeIfVisible(source, target, i, j);
											}
									}
							}
					}
					else {
							this.V = g0.V.slice(0);
							this.E = g0.E.slice(0);
					}
			}
			TangentVisibilityGraph.prototype.addEdgeIfVisible = function (u, v, i1, i2) {
					if (!this.intersectsPolys(new LineSegment(u.x, u.y, v.x, v.y), i1, i2)) {
							this.E.push(new VisibilityEdge(u.vv, v.vv));
					}
			};
			TangentVisibilityGraph.prototype.addPoint = function (p, i1) {
					var n = this.P.length;
					this.V.push(new VisibilityVertex(this.V.length, n, 0, p));
					for (var i = 0; i < n; ++i) {
							if (i === i1)
									continue;
							var poly = this.P[i], t = tangent_PointPolyC(p, poly);
							this.addEdgeIfVisible(p, poly[t.ltan], i1, i);
							this.addEdgeIfVisible(p, poly[t.rtan], i1, i);
					}
					return p.vv;
			};
			TangentVisibilityGraph.prototype.intersectsPolys = function (l, i1, i2) {
					for (var i = 0, n = this.P.length; i < n; ++i) {
							if (i != i1 && i != i2 && intersects(l, this.P[i]).length > 0) {
									return true;
							}
					}
					return false;
			};
			return TangentVisibilityGraph;
	}());
	exports.TangentVisibilityGraph = TangentVisibilityGraph;
	function intersects(l, P) {
			var ints = [];
			for (var i = 1, n = P.length; i < n; ++i) {
					var int = rectangle_1.Rectangle.lineIntersection(l.x1, l.y1, l.x2, l.y2, P[i - 1].x, P[i - 1].y, P[i].x, P[i].y);
					if (int)
							ints.push(int);
			}
			return ints;
	}
	function tangents(V, W) {
			var m = V.length - 1, n = W.length - 1;
			var bt = new BiTangents();
			for (var i = 0; i < m; ++i) {
					for (var j = 0; j < n; ++j) {
							var v1 = V[i == 0 ? m - 1 : i - 1];
							var v2 = V[i];
							var v3 = V[i + 1];
							var w1 = W[j == 0 ? n - 1 : j - 1];
							var w2 = W[j];
							var w3 = W[j + 1];
							var v1v2w2 = isLeft(v1, v2, w2);
							var v2w1w2 = isLeft(v2, w1, w2);
							var v2w2w3 = isLeft(v2, w2, w3);
							var w1w2v2 = isLeft(w1, w2, v2);
							var w2v1v2 = isLeft(w2, v1, v2);
							var w2v2v3 = isLeft(w2, v2, v3);
							if (v1v2w2 >= 0 && v2w1w2 >= 0 && v2w2w3 < 0
									&& w1w2v2 >= 0 && w2v1v2 >= 0 && w2v2v3 < 0) {
									bt.ll = new BiTangent(i, j);
							}
							else if (v1v2w2 <= 0 && v2w1w2 <= 0 && v2w2w3 > 0
									&& w1w2v2 <= 0 && w2v1v2 <= 0 && w2v2v3 > 0) {
									bt.rr = new BiTangent(i, j);
							}
							else if (v1v2w2 <= 0 && v2w1w2 > 0 && v2w2w3 <= 0
									&& w1w2v2 >= 0 && w2v1v2 < 0 && w2v2v3 >= 0) {
									bt.rl = new BiTangent(i, j);
							}
							else if (v1v2w2 >= 0 && v2w1w2 < 0 && v2w2w3 >= 0
									&& w1w2v2 <= 0 && w2v1v2 > 0 && w2v2v3 <= 0) {
									bt.lr = new BiTangent(i, j);
							}
					}
			}
			return bt;
	}
	exports.tangents = tangents;
	function isPointInsidePoly(p, poly) {
			for (var i = 1, n = poly.length; i < n; ++i)
					if (below(poly[i - 1], poly[i], p))
							return false;
			return true;
	}
	function isAnyPInQ(p, q) {
			return !p.every(function (v) { return !isPointInsidePoly(v, q); });
	}
	function polysOverlap(p, q) {
			if (isAnyPInQ(p, q))
					return true;
			if (isAnyPInQ(q, p))
					return true;
			for (var i = 1, n = p.length; i < n; ++i) {
					var v = p[i], u = p[i - 1];
					if (intersects(new LineSegment(u.x, u.y, v.x, v.y), q).length > 0)
							return true;
			}
			return false;
	}
	exports.polysOverlap = polysOverlap;
	
	},{"./rectangle":17}],9:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var rectangle_1 = require("./rectangle");
	var vpsc_1 = require("./vpsc");
	var shortestpaths_1 = require("./shortestpaths");
	var NodeWrapper = (function () {
			function NodeWrapper(id, rect, children) {
					this.id = id;
					this.rect = rect;
					this.children = children;
					this.leaf = typeof children === 'undefined' || children.length === 0;
			}
			return NodeWrapper;
	}());
	exports.NodeWrapper = NodeWrapper;
	var Vert = (function () {
			function Vert(id, x, y, node, line) {
					if (node === void 0) { node = null; }
					if (line === void 0) { line = null; }
					this.id = id;
					this.x = x;
					this.y = y;
					this.node = node;
					this.line = line;
			}
			return Vert;
	}());
	exports.Vert = Vert;
	var LongestCommonSubsequence = (function () {
			function LongestCommonSubsequence(s, t) {
					this.s = s;
					this.t = t;
					var mf = LongestCommonSubsequence.findMatch(s, t);
					var tr = t.slice(0).reverse();
					var mr = LongestCommonSubsequence.findMatch(s, tr);
					if (mf.length >= mr.length) {
							this.length = mf.length;
							this.si = mf.si;
							this.ti = mf.ti;
							this.reversed = false;
					}
					else {
							this.length = mr.length;
							this.si = mr.si;
							this.ti = t.length - mr.ti - mr.length;
							this.reversed = true;
					}
			}
			LongestCommonSubsequence.findMatch = function (s, t) {
					var m = s.length;
					var n = t.length;
					var match = { length: 0, si: -1, ti: -1 };
					var l = new Array(m);
					for (var i = 0; i < m; i++) {
							l[i] = new Array(n);
							for (var j = 0; j < n; j++)
									if (s[i] === t[j]) {
											var v = l[i][j] = (i === 0 || j === 0) ? 1 : l[i - 1][j - 1] + 1;
											if (v > match.length) {
													match.length = v;
													match.si = i - v + 1;
													match.ti = j - v + 1;
											}
											;
									}
									else
											l[i][j] = 0;
					}
					return match;
			};
			LongestCommonSubsequence.prototype.getSequence = function () {
					return this.length >= 0 ? this.s.slice(this.si, this.si + this.length) : [];
			};
			return LongestCommonSubsequence;
	}());
	exports.LongestCommonSubsequence = LongestCommonSubsequence;
	var GridRouter = (function () {
			function GridRouter(originalnodes, accessor, groupPadding) {
					if (groupPadding === void 0) { groupPadding = 12; }
					var _this = this;
					this.originalnodes = originalnodes;
					this.groupPadding = groupPadding;
					this.leaves = null;
					this.nodes = originalnodes.map(function (v, i) { return new NodeWrapper(i, accessor.getBounds(v), accessor.getChildren(v)); });
					this.leaves = this.nodes.filter(function (v) { return v.leaf; });
					this.groups = this.nodes.filter(function (g) { return !g.leaf; });
					this.cols = this.getGridLines('x');
					this.rows = this.getGridLines('y');
					this.groups.forEach(function (v) {
							return v.children.forEach(function (c) { return _this.nodes[c].parent = v; });
					});
					this.root = { children: [] };
					this.nodes.forEach(function (v) {
							if (typeof v.parent === 'undefined') {
									v.parent = _this.root;
									_this.root.children.push(v.id);
							}
							v.ports = [];
					});
					this.backToFront = this.nodes.slice(0);
					this.backToFront.sort(function (x, y) { return _this.getDepth(x) - _this.getDepth(y); });
					var frontToBackGroups = this.backToFront.slice(0).reverse().filter(function (g) { return !g.leaf; });
					frontToBackGroups.forEach(function (v) {
							var r = rectangle_1.Rectangle.empty();
							v.children.forEach(function (c) { return r = r.union(_this.nodes[c].rect); });
							v.rect = r.inflate(_this.groupPadding);
					});
					var colMids = this.midPoints(this.cols.map(function (r) { return r.pos; }));
					var rowMids = this.midPoints(this.rows.map(function (r) { return r.pos; }));
					var rowx = colMids[0], rowX = colMids[colMids.length - 1];
					var coly = rowMids[0], colY = rowMids[rowMids.length - 1];
					var hlines = this.rows.map(function (r) { return ({ x1: rowx, x2: rowX, y1: r.pos, y2: r.pos }); })
							.concat(rowMids.map(function (m) { return ({ x1: rowx, x2: rowX, y1: m, y2: m }); }));
					var vlines = this.cols.map(function (c) { return ({ x1: c.pos, x2: c.pos, y1: coly, y2: colY }); })
							.concat(colMids.map(function (m) { return ({ x1: m, x2: m, y1: coly, y2: colY }); }));
					var lines = hlines.concat(vlines);
					lines.forEach(function (l) { return l.verts = []; });
					this.verts = [];
					this.edges = [];
					hlines.forEach(function (h) {
							return vlines.forEach(function (v) {
									var p = new Vert(_this.verts.length, v.x1, h.y1);
									h.verts.push(p);
									v.verts.push(p);
									_this.verts.push(p);
									var i = _this.backToFront.length;
									while (i-- > 0) {
											var node = _this.backToFront[i], r = node.rect;
											var dx = Math.abs(p.x - r.cx()), dy = Math.abs(p.y - r.cy());
											if (dx < r.width() / 2 && dy < r.height() / 2) {
													p.node = node;
													break;
											}
									}
							});
					});
					lines.forEach(function (l, li) {
							_this.nodes.forEach(function (v, i) {
									v.rect.lineIntersections(l.x1, l.y1, l.x2, l.y2).forEach(function (intersect, j) {
											var p = new Vert(_this.verts.length, intersect.x, intersect.y, v, l);
											_this.verts.push(p);
											l.verts.push(p);
											v.ports.push(p);
									});
							});
							var isHoriz = Math.abs(l.y1 - l.y2) < 0.1;
							var delta = function (a, b) { return isHoriz ? b.x - a.x : b.y - a.y; };
							l.verts.sort(delta);
							for (var i = 1; i < l.verts.length; i++) {
									var u = l.verts[i - 1], v = l.verts[i];
									if (u.node && u.node === v.node && u.node.leaf)
											continue;
									_this.edges.push({ source: u.id, target: v.id, length: Math.abs(delta(u, v)) });
							}
					});
			}
			GridRouter.prototype.avg = function (a) { return a.reduce(function (x, y) { return x + y; }) / a.length; };
			GridRouter.prototype.getGridLines = function (axis) {
					var columns = [];
					var ls = this.leaves.slice(0, this.leaves.length);
					while (ls.length > 0) {
							var overlapping = ls.filter(function (v) { return v.rect['overlap' + axis.toUpperCase()](ls[0].rect); });
							var col = {
									nodes: overlapping,
									pos: this.avg(overlapping.map(function (v) { return v.rect['c' + axis](); }))
							};
							columns.push(col);
							col.nodes.forEach(function (v) { return ls.splice(ls.indexOf(v), 1); });
					}
					columns.sort(function (a, b) { return a.pos - b.pos; });
					return columns;
			};
			GridRouter.prototype.getDepth = function (v) {
					var depth = 0;
					while (v.parent !== this.root) {
							depth++;
							v = v.parent;
					}
					return depth;
			};
			GridRouter.prototype.midPoints = function (a) {
					var gap = a[1] - a[0];
					var mids = [a[0] - gap / 2];
					for (var i = 1; i < a.length; i++) {
							mids.push((a[i] + a[i - 1]) / 2);
					}
					mids.push(a[a.length - 1] + gap / 2);
					return mids;
			};
			GridRouter.prototype.findLineage = function (v) {
					var lineage = [v];
					do {
							v = v.parent;
							lineage.push(v);
					} while (v !== this.root);
					return lineage.reverse();
			};
			GridRouter.prototype.findAncestorPathBetween = function (a, b) {
					var aa = this.findLineage(a), ba = this.findLineage(b), i = 0;
					while (aa[i] === ba[i])
							i++;
					return { commonAncestor: aa[i - 1], lineages: aa.slice(i).concat(ba.slice(i)) };
			};
			GridRouter.prototype.siblingObstacles = function (a, b) {
					var _this = this;
					var path = this.findAncestorPathBetween(a, b);
					var lineageLookup = {};
					path.lineages.forEach(function (v) { return lineageLookup[v.id] = {}; });
					var obstacles = path.commonAncestor.children.filter(function (v) { return !(v in lineageLookup); });
					path.lineages
							.filter(function (v) { return v.parent !== path.commonAncestor; })
							.forEach(function (v) { return obstacles = obstacles.concat(v.parent.children.filter(function (c) { return c !== v.id; })); });
					return obstacles.map(function (v) { return _this.nodes[v]; });
			};
			GridRouter.getSegmentSets = function (routes, x, y) {
					var vsegments = [];
					for (var ei = 0; ei < routes.length; ei++) {
							var route = routes[ei];
							for (var si = 0; si < route.length; si++) {
									var s = route[si];
									s.edgeid = ei;
									s.i = si;
									var sdx = s[1][x] - s[0][x];
									if (Math.abs(sdx) < 0.1) {
											vsegments.push(s);
									}
							}
					}
					vsegments.sort(function (a, b) { return a[0][x] - b[0][x]; });
					var vsegmentsets = [];
					var segmentset = null;
					for (var i = 0; i < vsegments.length; i++) {
							var s = vsegments[i];
							if (!segmentset || Math.abs(s[0][x] - segmentset.pos) > 0.1) {
									segmentset = { pos: s[0][x], segments: [] };
									vsegmentsets.push(segmentset);
							}
							segmentset.segments.push(s);
					}
					return vsegmentsets;
			};
			GridRouter.nudgeSegs = function (x, y, routes, segments, leftOf, gap) {
					var n = segments.length;
					if (n <= 1)
							return;
					var vs = segments.map(function (s) { return new vpsc_1.Variable(s[0][x]); });
					var cs = [];
					for (var i = 0; i < n; i++) {
							for (var j = 0; j < n; j++) {
									if (i === j)
											continue;
									var s1 = segments[i], s2 = segments[j], e1 = s1.edgeid, e2 = s2.edgeid, lind = -1, rind = -1;
									if (x == 'x') {
											if (leftOf(e1, e2)) {
													if (s1[0][y] < s1[1][y]) {
															lind = j, rind = i;
													}
													else {
															lind = i, rind = j;
													}
											}
									}
									else {
											if (leftOf(e1, e2)) {
													if (s1[0][y] < s1[1][y]) {
															lind = i, rind = j;
													}
													else {
															lind = j, rind = i;
													}
											}
									}
									if (lind >= 0) {
											cs.push(new vpsc_1.Constraint(vs[lind], vs[rind], gap));
									}
							}
					}
					var solver = new vpsc_1.Solver(vs, cs);
					solver.solve();
					vs.forEach(function (v, i) {
							var s = segments[i];
							var pos = v.position();
							s[0][x] = s[1][x] = pos;
							var route = routes[s.edgeid];
							if (s.i > 0)
									route[s.i - 1][1][x] = pos;
							if (s.i < route.length - 1)
									route[s.i + 1][0][x] = pos;
					});
			};
			GridRouter.nudgeSegments = function (routes, x, y, leftOf, gap) {
					var vsegmentsets = GridRouter.getSegmentSets(routes, x, y);
					for (var i = 0; i < vsegmentsets.length; i++) {
							var ss = vsegmentsets[i];
							var events = [];
							for (var j = 0; j < ss.segments.length; j++) {
									var s = ss.segments[j];
									events.push({ type: 0, s: s, pos: Math.min(s[0][y], s[1][y]) });
									events.push({ type: 1, s: s, pos: Math.max(s[0][y], s[1][y]) });
							}
							events.sort(function (a, b) { return a.pos - b.pos + a.type - b.type; });
							var open = [];
							var openCount = 0;
							events.forEach(function (e) {
									if (e.type === 0) {
											open.push(e.s);
											openCount++;
									}
									else {
											openCount--;
									}
									if (openCount == 0) {
											GridRouter.nudgeSegs(x, y, routes, open, leftOf, gap);
											open = [];
									}
							});
					}
			};
			GridRouter.prototype.routeEdges = function (edges, nudgeGap, source, target) {
					var _this = this;
					var routePaths = edges.map(function (e) { return _this.route(source(e), target(e)); });
					var order = GridRouter.orderEdges(routePaths);
					var routes = routePaths.map(function (e) { return GridRouter.makeSegments(e); });
					GridRouter.nudgeSegments(routes, 'x', 'y', order, nudgeGap);
					GridRouter.nudgeSegments(routes, 'y', 'x', order, nudgeGap);
					GridRouter.unreverseEdges(routes, routePaths);
					return routes;
			};
			GridRouter.unreverseEdges = function (routes, routePaths) {
					routes.forEach(function (segments, i) {
							var path = routePaths[i];
							if (path.reversed) {
									segments.reverse();
									segments.forEach(function (segment) {
											segment.reverse();
									});
							}
					});
			};
			GridRouter.angleBetween2Lines = function (line1, line2) {
					var angle1 = Math.atan2(line1[0].y - line1[1].y, line1[0].x - line1[1].x);
					var angle2 = Math.atan2(line2[0].y - line2[1].y, line2[0].x - line2[1].x);
					var diff = angle1 - angle2;
					if (diff > Math.PI || diff < -Math.PI) {
							diff = angle2 - angle1;
					}
					return diff;
			};
			GridRouter.isLeft = function (a, b, c) {
					return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) <= 0;
			};
			GridRouter.getOrder = function (pairs) {
					var outgoing = {};
					for (var i = 0; i < pairs.length; i++) {
							var p = pairs[i];
							if (typeof outgoing[p.l] === 'undefined')
									outgoing[p.l] = {};
							outgoing[p.l][p.r] = true;
					}
					return function (l, r) { return typeof outgoing[l] !== 'undefined' && outgoing[l][r]; };
			};
			GridRouter.orderEdges = function (edges) {
					var edgeOrder = [];
					for (var i = 0; i < edges.length - 1; i++) {
							for (var j = i + 1; j < edges.length; j++) {
									var e = edges[i], f = edges[j], lcs = new LongestCommonSubsequence(e, f);
									var u, vi, vj;
									if (lcs.length === 0)
											continue;
									if (lcs.reversed) {
											f.reverse();
											f.reversed = true;
											lcs = new LongestCommonSubsequence(e, f);
									}
									if ((lcs.si <= 0 || lcs.ti <= 0) &&
											(lcs.si + lcs.length >= e.length || lcs.ti + lcs.length >= f.length)) {
											edgeOrder.push({ l: i, r: j });
											continue;
									}
									if (lcs.si + lcs.length >= e.length || lcs.ti + lcs.length >= f.length) {
											u = e[lcs.si + 1];
											vj = e[lcs.si - 1];
											vi = f[lcs.ti - 1];
									}
									else {
											u = e[lcs.si + lcs.length - 2];
											vi = e[lcs.si + lcs.length];
											vj = f[lcs.ti + lcs.length];
									}
									if (GridRouter.isLeft(u, vi, vj)) {
											edgeOrder.push({ l: j, r: i });
									}
									else {
											edgeOrder.push({ l: i, r: j });
									}
							}
					}
					return GridRouter.getOrder(edgeOrder);
			};
			GridRouter.makeSegments = function (path) {
					function copyPoint(p) {
							return { x: p.x, y: p.y };
					}
					var isStraight = function (a, b, c) { return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 0.001; };
					var segments = [];
					var a = copyPoint(path[0]);
					for (var i = 1; i < path.length; i++) {
							var b = copyPoint(path[i]), c = i < path.length - 1 ? path[i + 1] : null;
							if (!c || !isStraight(a, b, c)) {
									segments.push([a, b]);
									a = b;
							}
					}
					return segments;
			};
			GridRouter.prototype.route = function (s, t) {
					var _this = this;
					var source = this.nodes[s], target = this.nodes[t];
					this.obstacles = this.siblingObstacles(source, target);
					var obstacleLookup = {};
					this.obstacles.forEach(function (o) { return obstacleLookup[o.id] = o; });
					this.passableEdges = this.edges.filter(function (e) {
							var u = _this.verts[e.source], v = _this.verts[e.target];
							return !(u.node && u.node.id in obstacleLookup
									|| v.node && v.node.id in obstacleLookup);
					});
					for (var i = 1; i < source.ports.length; i++) {
							var u = source.ports[0].id;
							var v = source.ports[i].id;
							this.passableEdges.push({
									source: u,
									target: v,
									length: 0
							});
					}
					for (var i = 1; i < target.ports.length; i++) {
							var u = target.ports[0].id;
							var v = target.ports[i].id;
							this.passableEdges.push({
									source: u,
									target: v,
									length: 0
							});
					}
					var getSource = function (e) { return e.source; }, getTarget = function (e) { return e.target; }, getLength = function (e) { return e.length; };
					var shortestPathCalculator = new shortestpaths_1.Calculator(this.verts.length, this.passableEdges, getSource, getTarget, getLength);
					var bendPenalty = function (u, v, w) {
							var a = _this.verts[u], b = _this.verts[v], c = _this.verts[w];
							var dx = Math.abs(c.x - a.x), dy = Math.abs(c.y - a.y);
							if (a.node === source && a.node === b.node || b.node === target && b.node === c.node)
									return 0;
							return dx > 1 && dy > 1 ? 1000 : 0;
					};
					var shortestPath = shortestPathCalculator.PathFromNodeToNodeWithPrevCost(source.ports[0].id, target.ports[0].id, bendPenalty);
					var pathPoints = shortestPath.reverse().map(function (vi) { return _this.verts[vi]; });
					pathPoints.push(this.nodes[target.id].ports[0]);
					return pathPoints.filter(function (v, i) {
							return !(i < pathPoints.length - 1 && pathPoints[i + 1].node === source && v.node === source
									|| i > 0 && v.node === target && pathPoints[i - 1].node === target);
					});
			};
			GridRouter.getRoutePath = function (route, cornerradius, arrowwidth, arrowheight) {
					var result = {
							routepath: 'M ' + route[0][0].x + ' ' + route[0][0].y + ' ',
							arrowpath: ''
					};
					if (route.length > 1) {
							for (var i = 0; i < route.length; i++) {
									var li = route[i];
									var x = li[1].x, y = li[1].y;
									var dx = x - li[0].x;
									var dy = y - li[0].y;
									if (i < route.length - 1) {
											if (Math.abs(dx) > 0) {
													x -= dx / Math.abs(dx) * cornerradius;
											}
											else {
													y -= dy / Math.abs(dy) * cornerradius;
											}
											result.routepath += 'L ' + x + ' ' + y + ' ';
											var l = route[i + 1];
											var x0 = l[0].x, y0 = l[0].y;
											var x1 = l[1].x;
											var y1 = l[1].y;
											dx = x1 - x0;
											dy = y1 - y0;
											var angle = GridRouter.angleBetween2Lines(li, l) < 0 ? 1 : 0;
											var x2, y2;
											if (Math.abs(dx) > 0) {
													x2 = x0 + dx / Math.abs(dx) * cornerradius;
													y2 = y0;
											}
											else {
													x2 = x0;
													y2 = y0 + dy / Math.abs(dy) * cornerradius;
											}
											var cx = Math.abs(x2 - x);
											var cy = Math.abs(y2 - y);
											result.routepath += 'A ' + cx + ' ' + cy + ' 0 0 ' + angle + ' ' + x2 + ' ' + y2 + ' ';
									}
									else {
											var arrowtip = [x, y];
											var arrowcorner1, arrowcorner2;
											if (Math.abs(dx) > 0) {
													x -= dx / Math.abs(dx) * arrowheight;
													arrowcorner1 = [x, y + arrowwidth];
													arrowcorner2 = [x, y - arrowwidth];
											}
											else {
													y -= dy / Math.abs(dy) * arrowheight;
													arrowcorner1 = [x + arrowwidth, y];
													arrowcorner2 = [x - arrowwidth, y];
											}
											result.routepath += 'L ' + x + ' ' + y + ' ';
											if (arrowheight > 0) {
													result.arrowpath = 'M ' + arrowtip[0] + ' ' + arrowtip[1] + ' L ' + arrowcorner1[0] + ' ' + arrowcorner1[1]
															+ ' L ' + arrowcorner2[0] + ' ' + arrowcorner2[1];
											}
									}
							}
					}
					else {
							var li = route[0];
							var x = li[1].x, y = li[1].y;
							var dx = x - li[0].x;
							var dy = y - li[0].y;
							var arrowtip = [x, y];
							var arrowcorner1, arrowcorner2;
							if (Math.abs(dx) > 0) {
									x -= dx / Math.abs(dx) * arrowheight;
									arrowcorner1 = [x, y + arrowwidth];
									arrowcorner2 = [x, y - arrowwidth];
							}
							else {
									y -= dy / Math.abs(dy) * arrowheight;
									arrowcorner1 = [x + arrowwidth, y];
									arrowcorner2 = [x - arrowwidth, y];
							}
							result.routepath += 'L ' + x + ' ' + y + ' ';
							if (arrowheight > 0) {
									result.arrowpath = 'M ' + arrowtip[0] + ' ' + arrowtip[1] + ' L ' + arrowcorner1[0] + ' ' + arrowcorner1[1]
											+ ' L ' + arrowcorner2[0] + ' ' + arrowcorner2[1];
							}
					}
					return result;
			};
			return GridRouter;
	}());
	exports.GridRouter = GridRouter;
	
	},{"./rectangle":17,"./shortestpaths":18,"./vpsc":19}],10:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var packingOptions = {
			PADDING: 10,
			GOLDEN_SECTION: (1 + Math.sqrt(5)) / 2,
			FLOAT_EPSILON: 0.0001,
			MAX_INERATIONS: 100
	};
	function applyPacking(graphs, w, h, node_size, desired_ratio) {
			if (desired_ratio === void 0) { desired_ratio = 1; }
			var init_x = 0, init_y = 0, svg_width = w, svg_height = h, desired_ratio = typeof desired_ratio !== 'undefined' ? desired_ratio : 1, node_size = typeof node_size !== 'undefined' ? node_size : 0, real_width = 0, real_height = 0, min_width = 0, global_bottom = 0, line = [];
			if (graphs.length == 0)
					return;
			calculate_bb(graphs);
			apply(graphs, desired_ratio);
			put_nodes_to_right_positions(graphs);
			function calculate_bb(graphs) {
					graphs.forEach(function (g) {
							calculate_single_bb(g);
					});
					function calculate_single_bb(graph) {
							var min_x = Number.MAX_VALUE, min_y = Number.MAX_VALUE, max_x = 0, max_y = 0;
							graph.array.forEach(function (v) {
									var w = typeof v.width !== 'undefined' ? v.width : node_size;
									var h = typeof v.height !== 'undefined' ? v.height : node_size;
									w /= 2;
									h /= 2;
									max_x = Math.max(v.x + w, max_x);
									min_x = Math.min(v.x - w, min_x);
									max_y = Math.max(v.y + h, max_y);
									min_y = Math.min(v.y - h, min_y);
							});
							graph.width = max_x - min_x;
							graph.height = max_y - min_y;
					}
			}
			function put_nodes_to_right_positions(graphs) {
					graphs.forEach(function (g) {
							var center = { x: 0, y: 0 };
							g.array.forEach(function (node) {
									center.x += node.x;
									center.y += node.y;
							});
							center.x /= g.array.length;
							center.y /= g.array.length;
							var corner = { x: center.x - g.width / 2, y: center.y - g.height / 2 };
							var offset = { x: g.x - corner.x + svg_width / 2 - real_width / 2, y: g.y - corner.y + svg_height / 2 - real_height / 2 };
							g.array.forEach(function (node) {
									node.x += offset.x;
									node.y += offset.y;
							});
					});
			}
			function apply(data, desired_ratio) {
					var curr_best_f = Number.POSITIVE_INFINITY;
					var curr_best = 0;
					data.sort(function (a, b) { return b.height - a.height; });
					min_width = data.reduce(function (a, b) {
							return a.width < b.width ? a.width : b.width;
					});
					var left = x1 = min_width;
					var right = x2 = get_entire_width(data);
					var iterationCounter = 0;
					var f_x1 = Number.MAX_VALUE;
					var f_x2 = Number.MAX_VALUE;
					var flag = -1;
					var dx = Number.MAX_VALUE;
					var df = Number.MAX_VALUE;
					while ((dx > min_width) || df > packingOptions.FLOAT_EPSILON) {
							if (flag != 1) {
									var x1 = right - (right - left) / packingOptions.GOLDEN_SECTION;
									var f_x1 = step(data, x1);
							}
							if (flag != 0) {
									var x2 = left + (right - left) / packingOptions.GOLDEN_SECTION;
									var f_x2 = step(data, x2);
							}
							dx = Math.abs(x1 - x2);
							df = Math.abs(f_x1 - f_x2);
							if (f_x1 < curr_best_f) {
									curr_best_f = f_x1;
									curr_best = x1;
							}
							if (f_x2 < curr_best_f) {
									curr_best_f = f_x2;
									curr_best = x2;
							}
							if (f_x1 > f_x2) {
									left = x1;
									x1 = x2;
									f_x1 = f_x2;
									flag = 1;
							}
							else {
									right = x2;
									x2 = x1;
									f_x2 = f_x1;
									flag = 0;
							}
							if (iterationCounter++ > 100) {
									break;
							}
					}
					step(data, curr_best);
			}
			function step(data, max_width) {
					line = [];
					real_width = 0;
					real_height = 0;
					global_bottom = init_y;
					for (var i = 0; i < data.length; i++) {
							var o = data[i];
							put_rect(o, max_width);
					}
					return Math.abs(get_real_ratio() - desired_ratio);
			}
			function put_rect(rect, max_width) {
					var parent = undefined;
					for (var i = 0; i < line.length; i++) {
							if ((line[i].space_left >= rect.height) && (line[i].x + line[i].width + rect.width + packingOptions.PADDING - max_width) <= packingOptions.FLOAT_EPSILON) {
									parent = line[i];
									break;
							}
					}
					line.push(rect);
					if (parent !== undefined) {
							rect.x = parent.x + parent.width + packingOptions.PADDING;
							rect.y = parent.bottom;
							rect.space_left = rect.height;
							rect.bottom = rect.y;
							parent.space_left -= rect.height + packingOptions.PADDING;
							parent.bottom += rect.height + packingOptions.PADDING;
					}
					else {
							rect.y = global_bottom;
							global_bottom += rect.height + packingOptions.PADDING;
							rect.x = init_x;
							rect.bottom = rect.y;
							rect.space_left = rect.height;
					}
					if (rect.y + rect.height - real_height > -packingOptions.FLOAT_EPSILON)
							real_height = rect.y + rect.height - init_y;
					if (rect.x + rect.width - real_width > -packingOptions.FLOAT_EPSILON)
							real_width = rect.x + rect.width - init_x;
			}
			;
			function get_entire_width(data) {
					var width = 0;
					data.forEach(function (d) { return width += d.width + packingOptions.PADDING; });
					return width;
			}
			function get_real_ratio() {
					return (real_width / real_height);
			}
	}
	exports.applyPacking = applyPacking;
	function separateGraphs(nodes, links) {
			var marks = {};
			var ways = {};
			var graphs = [];
			var clusters = 0;
			for (var i = 0; i < links.length; i++) {
					var link = links[i];
					var n1 = link.source;
					var n2 = link.target;
					if (ways[n1.index])
							ways[n1.index].push(n2);
					else
							ways[n1.index] = [n2];
					if (ways[n2.index])
							ways[n2.index].push(n1);
					else
							ways[n2.index] = [n1];
			}
			for (var i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					if (marks[node.index])
							continue;
					explore_node(node, true);
			}
			function explore_node(n, is_new) {
					if (marks[n.index] !== undefined)
							return;
					if (is_new) {
							clusters++;
							graphs.push({ array: [] });
					}
					marks[n.index] = clusters;
					graphs[clusters - 1].array.push(n);
					var adjacent = ways[n.index];
					if (!adjacent)
							return;
					for (var j = 0; j < adjacent.length; j++) {
							explore_node(adjacent[j], false);
					}
			}
			return graphs;
	}
	exports.separateGraphs = separateGraphs;
	
	},{}],11:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var powergraph = require("./powergraph");
	var linklengths_1 = require("./linklengths");
	var descent_1 = require("./descent");
	var rectangle_1 = require("./rectangle");
	var shortestpaths_1 = require("./shortestpaths");
	var geom_1 = require("./geom");
	var handledisconnected_1 = require("./handledisconnected");
	var EventType;
	(function (EventType) {
			EventType[EventType["start"] = 0] = "start";
			EventType[EventType["tick"] = 1] = "tick";
			EventType[EventType["end"] = 2] = "end";
	})(EventType = exports.EventType || (exports.EventType = {}));
	;
	function isGroup(g) {
			return typeof g.leaves !== 'undefined' || typeof g.groups !== 'undefined';
	}
	var Layout = (function () {
			function Layout() {
					var _this = this;
					this._canvasSize = [1, 1];
					this._linkDistance = 20;
					this._defaultNodeSize = 10;
					this._linkLengthCalculator = null;
					this._linkType = null;
					this._avoidOverlaps = false;
					this._handleDisconnected = true;
					this._running = false;
					this._nodes = [];
					this._groups = [];
					this._rootGroup = null;
					this._links = [];
					this._constraints = [];
					this._distanceMatrix = null;
					this._descent = null;
					this._directedLinkConstraints = null;
					this._threshold = 0.01;
					this._visibilityGraph = null;
					this._groupCompactness = 1e-6;
					this.event = null;
					this.linkAccessor = {
							getSourceIndex: Layout.getSourceIndex,
							getTargetIndex: Layout.getTargetIndex,
							setLength: Layout.setLinkLength,
							getType: function (l) { return typeof _this._linkType === "function" ? _this._linkType(l) : 0; }
					};
			}
			Layout.prototype.on = function (e, listener) {
					if (!this.event)
							this.event = {};
					if (typeof e === 'string') {
							this.event[EventType[e]] = listener;
					}
					else {
							this.event[e] = listener;
					}
					return this;
			};
			Layout.prototype.trigger = function (e) {
					if (this.event && typeof this.event[e.type] !== 'undefined') {
							this.event[e.type](e);
					}
			};
			Layout.prototype.kick = function () {
					while (!this.tick())
							;
			};
			Layout.prototype.tick = function () {
					if (this._alpha < this._threshold) {
							this._running = false;
							this.trigger({ type: EventType.end, alpha: this._alpha = 0, stress: this._lastStress });
							return true;
					}
					var n = this._nodes.length, m = this._links.length;
					var o, i;
					this._descent.locks.clear();
					for (i = 0; i < n; ++i) {
							o = this._nodes[i];
							if (o.fixed) {
									if (typeof o.px === 'undefined' || typeof o.py === 'undefined') {
											o.px = o.x;
											o.py = o.y;
									}
									var p = [o.px, o.py];
									this._descent.locks.add(i, p);
							}
					}
					var s1 = this._descent.rungeKutta();
					if (s1 === 0) {
							this._alpha = 0;
					}
					else if (typeof this._lastStress !== 'undefined') {
							this._alpha = s1;
					}
					this._lastStress = s1;
					this.updateNodePositions();
					this.trigger({ type: EventType.tick, alpha: this._alpha, stress: this._lastStress });
					return false;
			};
			Layout.prototype.updateNodePositions = function () {
					var x = this._descent.x[0], y = this._descent.x[1];
					var o, i = this._nodes.length;
					while (i--) {
							o = this._nodes[i];
							o.x = x[i];
							o.y = y[i];
					}
			};
			Layout.prototype.nodes = function (v) {
					if (!v) {
							if (this._nodes.length === 0 && this._links.length > 0) {
									var n = 0;
									this._links.forEach(function (l) {
											n = Math.max(n, l.source, l.target);
									});
									this._nodes = new Array(++n);
									for (var i = 0; i < n; ++i) {
											this._nodes[i] = {};
									}
							}
							return this._nodes;
					}
					this._nodes = v;
					return this;
			};
			Layout.prototype.groups = function (x) {
					var _this = this;
					if (!x)
							return this._groups;
					this._groups = x;
					this._rootGroup = {};
					this._groups.forEach(function (g) {
							if (typeof g.padding === "undefined")
									g.padding = 1;
							if (typeof g.leaves !== "undefined") {
									g.leaves.forEach(function (v, i) {
											if (typeof v === 'number')
													(g.leaves[i] = _this._nodes[v]).parent = g;
									});
							}
							if (typeof g.groups !== "undefined") {
									g.groups.forEach(function (gi, i) {
											if (typeof gi === 'number')
													(g.groups[i] = _this._groups[gi]).parent = g;
									});
							}
					});
					this._rootGroup.leaves = this._nodes.filter(function (v) { return typeof v.parent === 'undefined'; });
					this._rootGroup.groups = this._groups.filter(function (g) { return typeof g.parent === 'undefined'; });
					return this;
			};
			Layout.prototype.powerGraphGroups = function (f) {
					var g = powergraph.getGroups(this._nodes, this._links, this.linkAccessor, this._rootGroup);
					this.groups(g.groups);
					f(g);
					return this;
			};
			Layout.prototype.avoidOverlaps = function (v) {
					if (!arguments.length)
							return this._avoidOverlaps;
					this._avoidOverlaps = v;
					return this;
			};
			Layout.prototype.handleDisconnected = function (v) {
					if (!arguments.length)
							return this._handleDisconnected;
					this._handleDisconnected = v;
					return this;
			};
			Layout.prototype.flowLayout = function (axis, minSeparation) {
					if (!arguments.length)
							axis = 'y';
					this._directedLinkConstraints = {
							axis: axis,
							getMinSeparation: typeof minSeparation === 'number' ? function () { return minSeparation; } : minSeparation
					};
					return this;
			};
			Layout.prototype.links = function (x) {
					if (!arguments.length)
							return this._links;
					this._links = x;
					return this;
			};
			Layout.prototype.constraints = function (c) {
					if (!arguments.length)
							return this._constraints;
					this._constraints = c;
					return this;
			};
			Layout.prototype.distanceMatrix = function (d) {
					if (!arguments.length)
							return this._distanceMatrix;
					this._distanceMatrix = d;
					return this;
			};
			Layout.prototype.size = function (x) {
					if (!x)
							return this._canvasSize;
					this._canvasSize = x;
					return this;
			};
			Layout.prototype.defaultNodeSize = function (x) {
					if (!x)
							return this._defaultNodeSize;
					this._defaultNodeSize = x;
					return this;
			};
			Layout.prototype.groupCompactness = function (x) {
					if (!x)
							return this._groupCompactness;
					this._groupCompactness = x;
					return this;
			};
			Layout.prototype.linkDistance = function (x) {
					if (!x) {
							return this._linkDistance;
					}
					this._linkDistance = typeof x === "function" ? x : +x;
					this._linkLengthCalculator = null;
					return this;
			};
			Layout.prototype.linkType = function (f) {
					this._linkType = f;
					return this;
			};
			Layout.prototype.convergenceThreshold = function (x) {
					if (!x)
							return this._threshold;
					this._threshold = typeof x === "function" ? x : +x;
					return this;
			};
			Layout.prototype.alpha = function (x) {
					if (!arguments.length)
							return this._alpha;
					else {
							x = +x;
							if (this._alpha) {
									if (x > 0)
											this._alpha = x;
									else
											this._alpha = 0;
							}
							else if (x > 0) {
									if (!this._running) {
											this._running = true;
											this.trigger({ type: EventType.start, alpha: this._alpha = x });
											this.kick();
									}
							}
							return this;
					}
			};
			Layout.prototype.getLinkLength = function (link) {
					return typeof this._linkDistance === "function" ? +(this._linkDistance(link)) : this._linkDistance;
			};
			Layout.setLinkLength = function (link, length) {
					link.length = length;
			};
			Layout.prototype.getLinkType = function (link) {
					return typeof this._linkType === "function" ? this._linkType(link) : 0;
			};
			Layout.prototype.symmetricDiffLinkLengths = function (idealLength, w) {
					var _this = this;
					if (w === void 0) { w = 1; }
					this.linkDistance(function (l) { return idealLength * l.length; });
					this._linkLengthCalculator = function () { return linklengths_1.symmetricDiffLinkLengths(_this._links, _this.linkAccessor, w); };
					return this;
			};
			Layout.prototype.jaccardLinkLengths = function (idealLength, w) {
					var _this = this;
					if (w === void 0) { w = 1; }
					this.linkDistance(function (l) { return idealLength * l.length; });
					this._linkLengthCalculator = function () { return linklengths_1.jaccardLinkLengths(_this._links, _this.linkAccessor, w); };
					return this;
			};
			Layout.prototype.start = function (initialUnconstrainedIterations, initialUserConstraintIterations, initialAllConstraintsIterations, gridSnapIterations, keepRunning) {
					var _this = this;
					if (initialUnconstrainedIterations === void 0) { initialUnconstrainedIterations = 0; }
					if (initialUserConstraintIterations === void 0) { initialUserConstraintIterations = 0; }
					if (initialAllConstraintsIterations === void 0) { initialAllConstraintsIterations = 0; }
					if (gridSnapIterations === void 0) { gridSnapIterations = 0; }
					if (keepRunning === void 0) { keepRunning = true; }
					var i, j, n = this.nodes().length, N = n + 2 * this._groups.length, m = this._links.length, w = this._canvasSize[0], h = this._canvasSize[1];
					var x = new Array(N), y = new Array(N);
					var G = null;
					var ao = this._avoidOverlaps;
					this._nodes.forEach(function (v, i) {
							v.index = i;
							if (typeof v.x === 'undefined') {
									v.x = w / 2, v.y = h / 2;
							}
							x[i] = v.x, y[i] = v.y;
					});
					if (this._linkLengthCalculator)
							this._linkLengthCalculator();
					var distances;
					if (this._distanceMatrix) {
							distances = this._distanceMatrix;
					}
					else {
							distances = (new shortestpaths_1.Calculator(N, this._links, Layout.getSourceIndex, Layout.getTargetIndex, function (l) { return _this.getLinkLength(l); })).DistanceMatrix();
							G = descent_1.Descent.createSquareMatrix(N, function () { return 2; });
							this._links.forEach(function (l) {
									if (typeof l.source == "number")
											l.source = _this._nodes[l.source];
									if (typeof l.target == "number")
											l.target = _this._nodes[l.target];
							});
							this._links.forEach(function (e) {
									var u = Layout.getSourceIndex(e), v = Layout.getTargetIndex(e);
									G[u][v] = G[v][u] = e.weight || 1;
							});
					}
					var D = descent_1.Descent.createSquareMatrix(N, function (i, j) {
							return distances[i][j];
					});
					if (this._rootGroup && typeof this._rootGroup.groups !== 'undefined') {
							var i = n;
							var addAttraction = function (i, j, strength, idealDistance) {
									G[i][j] = G[j][i] = strength;
									D[i][j] = D[j][i] = idealDistance;
							};
							this._groups.forEach(function (g) {
									addAttraction(i, i + 1, _this._groupCompactness, 0.1);
									x[i] = 0, y[i++] = 0;
									x[i] = 0, y[i++] = 0;
							});
					}
					else
							this._rootGroup = { leaves: this._nodes, groups: [] };
					var curConstraints = this._constraints || [];
					if (this._directedLinkConstraints) {
							this.linkAccessor.getMinSeparation = this._directedLinkConstraints.getMinSeparation;
							curConstraints = curConstraints.concat(linklengths_1.generateDirectedEdgeConstraints(n, this._links, this._directedLinkConstraints.axis, (this.linkAccessor)));
					}
					this.avoidOverlaps(false);
					this._descent = new descent_1.Descent([x, y], D);
					this._descent.locks.clear();
					for (var i = 0; i < n; ++i) {
							var o = this._nodes[i];
							if (o.fixed) {
									o.px = o.x;
									o.py = o.y;
									var p = [o.x, o.y];
									this._descent.locks.add(i, p);
							}
					}
					this._descent.threshold = this._threshold;
					this.initialLayout(initialUnconstrainedIterations, x, y);
					if (curConstraints.length > 0)
							this._descent.project = new rectangle_1.Projection(this._nodes, this._groups, this._rootGroup, curConstraints).projectFunctions();
					this._descent.run(initialUserConstraintIterations);
					this.separateOverlappingComponents(w, h);
					this.avoidOverlaps(ao);
					if (ao) {
							this._nodes.forEach(function (v, i) { v.x = x[i], v.y = y[i]; });
							this._descent.project = new rectangle_1.Projection(this._nodes, this._groups, this._rootGroup, curConstraints, true).projectFunctions();
							this._nodes.forEach(function (v, i) { x[i] = v.x, y[i] = v.y; });
					}
					this._descent.G = G;
					this._descent.run(initialAllConstraintsIterations);
					if (gridSnapIterations) {
							this._descent.snapStrength = 1000;
							this._descent.snapGridSize = this._nodes[0].width;
							this._descent.numGridSnapNodes = n;
							this._descent.scaleSnapByMaxH = n != N;
							var G0 = descent_1.Descent.createSquareMatrix(N, function (i, j) {
									if (i >= n || j >= n)
											return G[i][j];
									return 0;
							});
							this._descent.G = G0;
							this._descent.run(gridSnapIterations);
					}
					this.updateNodePositions();
					this.separateOverlappingComponents(w, h);
					return keepRunning ? this.resume() : this;
			};
			Layout.prototype.initialLayout = function (iterations, x, y) {
					if (this._groups.length > 0 && iterations > 0) {
							var n = this._nodes.length;
							var edges = this._links.map(function (e) { return ({ source: e.source.index, target: e.target.index }); });
							var vs = this._nodes.map(function (v) { return ({ index: v.index }); });
							this._groups.forEach(function (g, i) {
									vs.push({ index: g.index = n + i });
							});
							this._groups.forEach(function (g, i) {
									if (typeof g.leaves !== 'undefined')
											g.leaves.forEach(function (v) { return edges.push({ source: g.index, target: v.index }); });
									if (typeof g.groups !== 'undefined')
											g.groups.forEach(function (gg) { return edges.push({ source: g.index, target: gg.index }); });
							});
							new Layout()
									.size(this.size())
									.nodes(vs)
									.links(edges)
									.avoidOverlaps(false)
									.linkDistance(this.linkDistance())
									.symmetricDiffLinkLengths(5)
									.convergenceThreshold(1e-4)
									.start(iterations, 0, 0, 0, false);
							this._nodes.forEach(function (v) {
									x[v.index] = vs[v.index].x;
									y[v.index] = vs[v.index].y;
							});
					}
					else {
							this._descent.run(iterations);
					}
			};
			Layout.prototype.separateOverlappingComponents = function (width, height) {
					var _this = this;
					if (!this._distanceMatrix && this._handleDisconnected) {
							var x_1 = this._descent.x[0], y_1 = this._descent.x[1];
							this._nodes.forEach(function (v, i) { v.x = x_1[i], v.y = y_1[i]; });
							var graphs = handledisconnected_1.separateGraphs(this._nodes, this._links);
							handledisconnected_1.applyPacking(graphs, width, height, this._defaultNodeSize);
							this._nodes.forEach(function (v, i) {
									_this._descent.x[0][i] = v.x, _this._descent.x[1][i] = v.y;
									if (v.bounds) {
											v.bounds.setXCentre(v.x);
											v.bounds.setYCentre(v.y);
									}
							});
					}
			};
			Layout.prototype.resume = function () {
					return this.alpha(0.1);
			};
			Layout.prototype.stop = function () {
					return this.alpha(0);
			};
			Layout.prototype.prepareEdgeRouting = function (nodeMargin) {
					if (nodeMargin === void 0) { nodeMargin = 0; }
					this._visibilityGraph = new geom_1.TangentVisibilityGraph(this._nodes.map(function (v) {
							return v.bounds.inflate(-nodeMargin).vertices();
					}));
			};
			Layout.prototype.routeEdge = function (edge, draw) {
					var lineData = [];
					var vg2 = new geom_1.TangentVisibilityGraph(this._visibilityGraph.P, { V: this._visibilityGraph.V, E: this._visibilityGraph.E }), port1 = { x: edge.source.x, y: edge.source.y }, port2 = { x: edge.target.x, y: edge.target.y }, start = vg2.addPoint(port1, edge.source.index), end = vg2.addPoint(port2, edge.target.index);
					vg2.addEdgeIfVisible(port1, port2, edge.source.index, edge.target.index);
					if (typeof draw !== 'undefined') {
							draw(vg2);
					}
					var sourceInd = function (e) { return e.source.id; }, targetInd = function (e) { return e.target.id; }, length = function (e) { return e.length(); }, spCalc = new shortestpaths_1.Calculator(vg2.V.length, vg2.E, sourceInd, targetInd, length), shortestPath = spCalc.PathFromNodeToNode(start.id, end.id);
					if (shortestPath.length === 1 || shortestPath.length === vg2.V.length) {
							var route = rectangle_1.makeEdgeBetween(edge.source.innerBounds, edge.target.innerBounds, 5);
							lineData = [route.sourceIntersection, route.arrowStart];
					}
					else {
							var n = shortestPath.length - 2, p = vg2.V[shortestPath[n]].p, q = vg2.V[shortestPath[0]].p, lineData = [edge.source.innerBounds.rayIntersection(p.x, p.y)];
							for (var i = n; i >= 0; --i)
									lineData.push(vg2.V[shortestPath[i]].p);
							lineData.push(rectangle_1.makeEdgeTo(q, edge.target.innerBounds, 5));
					}
					return lineData;
			};
			Layout.getSourceIndex = function (e) {
					return typeof e.source === 'number' ? e.source : e.source.index;
			};
			Layout.getTargetIndex = function (e) {
					return typeof e.target === 'number' ? e.target : e.target.index;
			};
			Layout.linkId = function (e) {
					return Layout.getSourceIndex(e) + "-" + Layout.getTargetIndex(e);
			};
			Layout.dragStart = function (d) {
					if (isGroup(d)) {
							Layout.storeOffset(d, Layout.dragOrigin(d));
					}
					else {
							Layout.stopNode(d);
							d.fixed |= 2;
					}
			};
			Layout.stopNode = function (v) {
					v.px = v.x;
					v.py = v.y;
			};
			Layout.storeOffset = function (d, origin) {
					if (typeof d.leaves !== 'undefined') {
							d.leaves.forEach(function (v) {
									v.fixed |= 2;
									Layout.stopNode(v);
									v._dragGroupOffsetX = v.x - origin.x;
									v._dragGroupOffsetY = v.y - origin.y;
							});
					}
					if (typeof d.groups !== 'undefined') {
							d.groups.forEach(function (g) { return Layout.storeOffset(g, origin); });
					}
			};
			Layout.dragOrigin = function (d) {
					if (isGroup(d)) {
							return {
									x: d.bounds.cx(),
									y: d.bounds.cy()
							};
					}
					else {
							return d;
					}
			};
			Layout.drag = function (d, position) {
					if (isGroup(d)) {
							if (typeof d.leaves !== 'undefined') {
									d.leaves.forEach(function (v) {
											d.bounds.setXCentre(position.x);
											d.bounds.setYCentre(position.y);
											v.px = v._dragGroupOffsetX + position.x;
											v.py = v._dragGroupOffsetY + position.y;
									});
							}
							if (typeof d.groups !== 'undefined') {
									d.groups.forEach(function (g) { return Layout.drag(g, position); });
							}
					}
					else {
							d.px = position.x;
							d.py = position.y;
					}
			};
			Layout.dragEnd = function (d) {
					if (isGroup(d)) {
							if (typeof d.leaves !== 'undefined') {
									d.leaves.forEach(function (v) {
											Layout.dragEnd(v);
											delete v._dragGroupOffsetX;
											delete v._dragGroupOffsetY;
									});
							}
							if (typeof d.groups !== 'undefined') {
									d.groups.forEach(Layout.dragEnd);
							}
					}
					else {
							d.fixed &= ~6;
					}
			};
			Layout.mouseOver = function (d) {
					d.fixed |= 4;
					d.px = d.x, d.py = d.y;
			};
			Layout.mouseOut = function (d) {
					d.fixed &= ~4;
			};
			return Layout;
	}());
	exports.Layout = Layout;
	
	},{"./descent":7,"./geom":8,"./handledisconnected":10,"./linklengths":13,"./powergraph":14,"./rectangle":17,"./shortestpaths":18}],12:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var shortestpaths_1 = require("./shortestpaths");
	var descent_1 = require("./descent");
	var rectangle_1 = require("./rectangle");
	var linklengths_1 = require("./linklengths");
	var Link3D = (function () {
			function Link3D(source, target) {
					this.source = source;
					this.target = target;
			}
			Link3D.prototype.actualLength = function (x) {
					var _this = this;
					return Math.sqrt(x.reduce(function (c, v) {
							var dx = v[_this.target] - v[_this.source];
							return c + dx * dx;
					}, 0));
			};
			return Link3D;
	}());
	exports.Link3D = Link3D;
	var Node3D = (function () {
			function Node3D(x, y, z) {
					if (x === void 0) { x = 0; }
					if (y === void 0) { y = 0; }
					if (z === void 0) { z = 0; }
					this.x = x;
					this.y = y;
					this.z = z;
			}
			return Node3D;
	}());
	exports.Node3D = Node3D;
	var Layout3D = (function () {
			function Layout3D(nodes, links, idealLinkLength) {
					if (idealLinkLength === void 0) { idealLinkLength = 1; }
					var _this = this;
					this.nodes = nodes;
					this.links = links;
					this.idealLinkLength = idealLinkLength;
					this.constraints = null;
					this.useJaccardLinkLengths = true;
					this.result = new Array(Layout3D.k);
					for (var i = 0; i < Layout3D.k; ++i) {
							this.result[i] = new Array(nodes.length);
					}
					nodes.forEach(function (v, i) {
							for (var _i = 0, _a = Layout3D.dims; _i < _a.length; _i++) {
									var dim = _a[_i];
									if (typeof v[dim] == 'undefined')
											v[dim] = Math.random();
							}
							_this.result[0][i] = v.x;
							_this.result[1][i] = v.y;
							_this.result[2][i] = v.z;
					});
			}
			;
			Layout3D.prototype.linkLength = function (l) {
					return l.actualLength(this.result);
			};
			Layout3D.prototype.start = function (iterations) {
					var _this = this;
					if (iterations === void 0) { iterations = 100; }
					var n = this.nodes.length;
					var linkAccessor = new LinkAccessor();
					if (this.useJaccardLinkLengths)
							linklengths_1.jaccardLinkLengths(this.links, linkAccessor, 1.5);
					this.links.forEach(function (e) { return e.length *= _this.idealLinkLength; });
					var distanceMatrix = (new shortestpaths_1.Calculator(n, this.links, function (e) { return e.source; }, function (e) { return e.target; }, function (e) { return e.length; })).DistanceMatrix();
					var D = descent_1.Descent.createSquareMatrix(n, function (i, j) { return distanceMatrix[i][j]; });
					var G = descent_1.Descent.createSquareMatrix(n, function () { return 2; });
					this.links.forEach(function (_a) {
							var source = _a.source, target = _a.target;
							return G[source][target] = G[target][source] = 1;
					});
					this.descent = new descent_1.Descent(this.result, D);
					this.descent.threshold = 1e-3;
					this.descent.G = G;
					if (this.constraints)
							this.descent.project = new rectangle_1.Projection(this.nodes, null, null, this.constraints).projectFunctions();
					for (var i = 0; i < this.nodes.length; i++) {
							var v = this.nodes[i];
							if (v.fixed) {
									this.descent.locks.add(i, [v.x, v.y, v.z]);
							}
					}
					this.descent.run(iterations);
					return this;
			};
			Layout3D.prototype.tick = function () {
					this.descent.locks.clear();
					for (var i = 0; i < this.nodes.length; i++) {
							var v = this.nodes[i];
							if (v.fixed) {
									this.descent.locks.add(i, [v.x, v.y, v.z]);
							}
					}
					return this.descent.rungeKutta();
			};
			return Layout3D;
	}());
	Layout3D.dims = ['x', 'y', 'z'];
	Layout3D.k = Layout3D.dims.length;
	exports.Layout3D = Layout3D;
	var LinkAccessor = (function () {
			function LinkAccessor() {
			}
			LinkAccessor.prototype.getSourceIndex = function (e) { return e.source; };
			LinkAccessor.prototype.getTargetIndex = function (e) { return e.target; };
			LinkAccessor.prototype.getLength = function (e) { return e.length; };
			LinkAccessor.prototype.setLength = function (e, l) { e.length = l; };
			return LinkAccessor;
	}());
	
	},{"./descent":7,"./linklengths":13,"./rectangle":17,"./shortestpaths":18}],13:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	function unionCount(a, b) {
			var u = {};
			for (var i in a)
					u[i] = {};
			for (var i in b)
					u[i] = {};
			return Object.keys(u).length;
	}
	function intersectionCount(a, b) {
			var n = 0;
			for (var i in a)
					if (typeof b[i] !== 'undefined')
							++n;
			return n;
	}
	function getNeighbours(links, la) {
			var neighbours = {};
			var addNeighbours = function (u, v) {
					if (typeof neighbours[u] === 'undefined')
							neighbours[u] = {};
					neighbours[u][v] = {};
			};
			links.forEach(function (e) {
					var u = la.getSourceIndex(e), v = la.getTargetIndex(e);
					addNeighbours(u, v);
					addNeighbours(v, u);
			});
			return neighbours;
	}
	function computeLinkLengths(links, w, f, la) {
			var neighbours = getNeighbours(links, la);
			links.forEach(function (l) {
					var a = neighbours[la.getSourceIndex(l)];
					var b = neighbours[la.getTargetIndex(l)];
					la.setLength(l, 1 + w * f(a, b));
			});
	}
	function symmetricDiffLinkLengths(links, la, w) {
			if (w === void 0) { w = 1; }
			computeLinkLengths(links, w, function (a, b) { return Math.sqrt(unionCount(a, b) - intersectionCount(a, b)); }, la);
	}
	exports.symmetricDiffLinkLengths = symmetricDiffLinkLengths;
	function jaccardLinkLengths(links, la, w) {
			if (w === void 0) { w = 1; }
			computeLinkLengths(links, w, function (a, b) {
					return Math.min(Object.keys(a).length, Object.keys(b).length) < 1.1 ? 0 : intersectionCount(a, b) / unionCount(a, b);
			}, la);
	}
	exports.jaccardLinkLengths = jaccardLinkLengths;
	function generateDirectedEdgeConstraints(n, links, axis, la) {
			var components = stronglyConnectedComponents(n, links, la);
			var nodes = {};
			components.forEach(function (c, i) {
					return c.forEach(function (v) { return nodes[v] = i; });
			});
			var constraints = [];
			links.forEach(function (l) {
					var ui = la.getSourceIndex(l), vi = la.getTargetIndex(l), u = nodes[ui], v = nodes[vi];
					if (u !== v) {
							constraints.push({
									axis: axis,
									left: ui,
									right: vi,
									gap: la.getMinSeparation(l)
							});
					}
			});
			return constraints;
	}
	exports.generateDirectedEdgeConstraints = generateDirectedEdgeConstraints;
	function stronglyConnectedComponents(numVertices, edges, la) {
			var nodes = [];
			var index = 0;
			var stack = [];
			var components = [];
			function strongConnect(v) {
					v.index = v.lowlink = index++;
					stack.push(v);
					v.onStack = true;
					for (var _i = 0, _a = v.out; _i < _a.length; _i++) {
							var w = _a[_i];
							if (typeof w.index === 'undefined') {
									strongConnect(w);
									v.lowlink = Math.min(v.lowlink, w.lowlink);
							}
							else if (w.onStack) {
									v.lowlink = Math.min(v.lowlink, w.index);
							}
					}
					if (v.lowlink === v.index) {
							var component = [];
							while (stack.length) {
									w = stack.pop();
									w.onStack = false;
									component.push(w);
									if (w === v)
											break;
							}
							components.push(component.map(function (v) { return v.id; }));
					}
			}
			for (var i = 0; i < numVertices; i++) {
					nodes.push({ id: i, out: [] });
			}
			for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
					var e = edges_1[_i];
					var v_1 = nodes[la.getSourceIndex(e)], w = nodes[la.getTargetIndex(e)];
					v_1.out.push(w);
			}
			for (var _a = 0, nodes_1 = nodes; _a < nodes_1.length; _a++) {
					var v = nodes_1[_a];
					if (typeof v.index === 'undefined')
							strongConnect(v);
			}
			return components;
	}
	exports.stronglyConnectedComponents = stronglyConnectedComponents;
	
	},{}],14:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var PowerEdge = (function () {
			function PowerEdge(source, target, type) {
					this.source = source;
					this.target = target;
					this.type = type;
			}
			return PowerEdge;
	}());
	exports.PowerEdge = PowerEdge;
	var Configuration = (function () {
			function Configuration(n, edges, linkAccessor, rootGroup) {
					var _this = this;
					this.linkAccessor = linkAccessor;
					this.modules = new Array(n);
					this.roots = [];
					if (rootGroup) {
							this.initModulesFromGroup(rootGroup);
					}
					else {
							this.roots.push(new ModuleSet());
							for (var i = 0; i < n; ++i)
									this.roots[0].add(this.modules[i] = new Module(i));
					}
					this.R = edges.length;
					edges.forEach(function (e) {
							var s = _this.modules[linkAccessor.getSourceIndex(e)], t = _this.modules[linkAccessor.getTargetIndex(e)], type = linkAccessor.getType(e);
							s.outgoing.add(type, t);
							t.incoming.add(type, s);
					});
			}
			Configuration.prototype.initModulesFromGroup = function (group) {
					var moduleSet = new ModuleSet();
					this.roots.push(moduleSet);
					for (var i = 0; i < group.leaves.length; ++i) {
							var node = group.leaves[i];
							var module = new Module(node.id);
							this.modules[node.id] = module;
							moduleSet.add(module);
					}
					if (group.groups) {
							for (var j = 0; j < group.groups.length; ++j) {
									var child = group.groups[j];
									var definition = {};
									for (var prop in child)
											if (prop !== "leaves" && prop !== "groups" && child.hasOwnProperty(prop))
													definition[prop] = child[prop];
									moduleSet.add(new Module(-1 - j, new LinkSets(), new LinkSets(), this.initModulesFromGroup(child), definition));
							}
					}
					return moduleSet;
			};
			Configuration.prototype.merge = function (a, b, k) {
					if (k === void 0) { k = 0; }
					var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
					var children = new ModuleSet();
					children.add(a);
					children.add(b);
					var m = new Module(this.modules.length, outInt, inInt, children);
					this.modules.push(m);
					var update = function (s, i, o) {
							s.forAll(function (ms, linktype) {
									ms.forAll(function (n) {
											var nls = n[i];
											nls.add(linktype, m);
											nls.remove(linktype, a);
											nls.remove(linktype, b);
											a[o].remove(linktype, n);
											b[o].remove(linktype, n);
									});
							});
					};
					update(outInt, "incoming", "outgoing");
					update(inInt, "outgoing", "incoming");
					this.R -= inInt.count() + outInt.count();
					this.roots[k].remove(a);
					this.roots[k].remove(b);
					this.roots[k].add(m);
					return m;
			};
			Configuration.prototype.rootMerges = function (k) {
					if (k === void 0) { k = 0; }
					var rs = this.roots[k].modules();
					var n = rs.length;
					var merges = new Array(n * (n - 1));
					var ctr = 0;
					for (var i = 0, i_ = n - 1; i < i_; ++i) {
							for (var j = i + 1; j < n; ++j) {
									var a = rs[i], b = rs[j];
									merges[ctr] = { id: ctr, nEdges: this.nEdges(a, b), a: a, b: b };
									ctr++;
							}
					}
					return merges;
			};
			Configuration.prototype.greedyMerge = function () {
					for (var i = 0; i < this.roots.length; ++i) {
							if (this.roots[i].modules().length < 2)
									continue;
							var ms = this.rootMerges(i).sort(function (a, b) { return a.nEdges == b.nEdges ? a.id - b.id : a.nEdges - b.nEdges; });
							var m = ms[0];
							if (m.nEdges >= this.R)
									continue;
							this.merge(m.a, m.b, i);
							return true;
					}
			};
			Configuration.prototype.nEdges = function (a, b) {
					var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
					return this.R - inInt.count() - outInt.count();
			};
			Configuration.prototype.getGroupHierarchy = function (retargetedEdges) {
					var _this = this;
					var groups = [];
					var root = {};
					toGroups(this.roots[0], root, groups);
					var es = this.allEdges();
					es.forEach(function (e) {
							var a = _this.modules[e.source];
							var b = _this.modules[e.target];
							retargetedEdges.push(new PowerEdge(typeof a.gid === "undefined" ? e.source : groups[a.gid], typeof b.gid === "undefined" ? e.target : groups[b.gid], e.type));
					});
					return groups;
			};
			Configuration.prototype.allEdges = function () {
					var es = [];
					Configuration.getEdges(this.roots[0], es);
					return es;
			};
			Configuration.getEdges = function (modules, es) {
					modules.forAll(function (m) {
							m.getEdges(es);
							Configuration.getEdges(m.children, es);
					});
			};
			return Configuration;
	}());
	exports.Configuration = Configuration;
	function toGroups(modules, group, groups) {
			modules.forAll(function (m) {
					if (m.isLeaf()) {
							if (!group.leaves)
									group.leaves = [];
							group.leaves.push(m.id);
					}
					else {
							var g = group;
							m.gid = groups.length;
							if (!m.isIsland() || m.isPredefined()) {
									g = { id: m.gid };
									if (m.isPredefined())
											for (var prop in m.definition)
													g[prop] = m.definition[prop];
									if (!group.groups)
											group.groups = [];
									group.groups.push(m.gid);
									groups.push(g);
							}
							toGroups(m.children, g, groups);
					}
			});
	}
	var Module = (function () {
			function Module(id, outgoing, incoming, children, definition) {
					if (outgoing === void 0) { outgoing = new LinkSets(); }
					if (incoming === void 0) { incoming = new LinkSets(); }
					if (children === void 0) { children = new ModuleSet(); }
					this.id = id;
					this.outgoing = outgoing;
					this.incoming = incoming;
					this.children = children;
					this.definition = definition;
			}
			Module.prototype.getEdges = function (es) {
					var _this = this;
					this.outgoing.forAll(function (ms, edgetype) {
							ms.forAll(function (target) {
									es.push(new PowerEdge(_this.id, target.id, edgetype));
							});
					});
			};
			Module.prototype.isLeaf = function () {
					return this.children.count() === 0;
			};
			Module.prototype.isIsland = function () {
					return this.outgoing.count() === 0 && this.incoming.count() === 0;
			};
			Module.prototype.isPredefined = function () {
					return typeof this.definition !== "undefined";
			};
			return Module;
	}());
	exports.Module = Module;
	function intersection(m, n) {
			var i = {};
			for (var v in m)
					if (v in n)
							i[v] = m[v];
			return i;
	}
	var ModuleSet = (function () {
			function ModuleSet() {
					this.table = {};
			}
			ModuleSet.prototype.count = function () {
					return Object.keys(this.table).length;
			};
			ModuleSet.prototype.intersection = function (other) {
					var result = new ModuleSet();
					result.table = intersection(this.table, other.table);
					return result;
			};
			ModuleSet.prototype.intersectionCount = function (other) {
					return this.intersection(other).count();
			};
			ModuleSet.prototype.contains = function (id) {
					return id in this.table;
			};
			ModuleSet.prototype.add = function (m) {
					this.table[m.id] = m;
			};
			ModuleSet.prototype.remove = function (m) {
					delete this.table[m.id];
			};
			ModuleSet.prototype.forAll = function (f) {
					for (var mid in this.table) {
							f(this.table[mid]);
					}
			};
			ModuleSet.prototype.modules = function () {
					var vs = [];
					this.forAll(function (m) {
							if (!m.isPredefined())
									vs.push(m);
					});
					return vs;
			};
			return ModuleSet;
	}());
	exports.ModuleSet = ModuleSet;
	var LinkSets = (function () {
			function LinkSets() {
					this.sets = {};
					this.n = 0;
			}
			LinkSets.prototype.count = function () {
					return this.n;
			};
			LinkSets.prototype.contains = function (id) {
					var result = false;
					this.forAllModules(function (m) {
							if (!result && m.id == id) {
									result = true;
							}
					});
					return result;
			};
			LinkSets.prototype.add = function (linktype, m) {
					var s = linktype in this.sets ? this.sets[linktype] : this.sets[linktype] = new ModuleSet();
					s.add(m);
					++this.n;
			};
			LinkSets.prototype.remove = function (linktype, m) {
					var ms = this.sets[linktype];
					ms.remove(m);
					if (ms.count() === 0) {
							delete this.sets[linktype];
					}
					--this.n;
			};
			LinkSets.prototype.forAll = function (f) {
					for (var linktype in this.sets) {
							f(this.sets[linktype], Number(linktype));
					}
			};
			LinkSets.prototype.forAllModules = function (f) {
					this.forAll(function (ms, lt) { return ms.forAll(f); });
			};
			LinkSets.prototype.intersection = function (other) {
					var result = new LinkSets();
					this.forAll(function (ms, lt) {
							if (lt in other.sets) {
									var i = ms.intersection(other.sets[lt]), n = i.count();
									if (n > 0) {
											result.sets[lt] = i;
											result.n += n;
									}
							}
					});
					return result;
			};
			return LinkSets;
	}());
	exports.LinkSets = LinkSets;
	function intersectionCount(m, n) {
			return Object.keys(intersection(m, n)).length;
	}
	function getGroups(nodes, links, la, rootGroup) {
			var n = nodes.length, c = new Configuration(n, links, la, rootGroup);
			while (c.greedyMerge())
					;
			var powerEdges = [];
			var g = c.getGroupHierarchy(powerEdges);
			powerEdges.forEach(function (e) {
					var f = function (end) {
							var g = e[end];
							if (typeof g == "number")
									e[end] = nodes[g];
					};
					f("source");
					f("target");
			});
			return { groups: g, powerEdges: powerEdges };
	}
	exports.getGroups = getGroups;
	
	},{}],15:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var PairingHeap = (function () {
			function PairingHeap(elem) {
					this.elem = elem;
					this.subheaps = [];
			}
			PairingHeap.prototype.toString = function (selector) {
					var str = "", needComma = false;
					for (var i = 0; i < this.subheaps.length; ++i) {
							var subheap = this.subheaps[i];
							if (!subheap.elem) {
									needComma = false;
									continue;
							}
							if (needComma) {
									str = str + ",";
							}
							str = str + subheap.toString(selector);
							needComma = true;
					}
					if (str !== "") {
							str = "(" + str + ")";
					}
					return (this.elem ? selector(this.elem) : "") + str;
			};
			PairingHeap.prototype.forEach = function (f) {
					if (!this.empty()) {
							f(this.elem, this);
							this.subheaps.forEach(function (s) { return s.forEach(f); });
					}
			};
			PairingHeap.prototype.count = function () {
					return this.empty() ? 0 : 1 + this.subheaps.reduce(function (n, h) {
							return n + h.count();
					}, 0);
			};
			PairingHeap.prototype.min = function () {
					return this.elem;
			};
			PairingHeap.prototype.empty = function () {
					return this.elem == null;
			};
			PairingHeap.prototype.contains = function (h) {
					if (this === h)
							return true;
					for (var i = 0; i < this.subheaps.length; i++) {
							if (this.subheaps[i].contains(h))
									return true;
					}
					return false;
			};
			PairingHeap.prototype.isHeap = function (lessThan) {
					var _this = this;
					return this.subheaps.every(function (h) { return lessThan(_this.elem, h.elem) && h.isHeap(lessThan); });
			};
			PairingHeap.prototype.insert = function (obj, lessThan) {
					return this.merge(new PairingHeap(obj), lessThan);
			};
			PairingHeap.prototype.merge = function (heap2, lessThan) {
					if (this.empty())
							return heap2;
					else if (heap2.empty())
							return this;
					else if (lessThan(this.elem, heap2.elem)) {
							this.subheaps.push(heap2);
							return this;
					}
					else {
							heap2.subheaps.push(this);
							return heap2;
					}
			};
			PairingHeap.prototype.removeMin = function (lessThan) {
					if (this.empty())
							return null;
					else
							return this.mergePairs(lessThan);
			};
			PairingHeap.prototype.mergePairs = function (lessThan) {
					if (this.subheaps.length == 0)
							return new PairingHeap(null);
					else if (this.subheaps.length == 1) {
							return this.subheaps[0];
					}
					else {
							var firstPair = this.subheaps.pop().merge(this.subheaps.pop(), lessThan);
							var remaining = this.mergePairs(lessThan);
							return firstPair.merge(remaining, lessThan);
					}
			};
			PairingHeap.prototype.decreaseKey = function (subheap, newValue, setHeapNode, lessThan) {
					var newHeap = subheap.removeMin(lessThan);
					subheap.elem = newHeap.elem;
					subheap.subheaps = newHeap.subheaps;
					if (setHeapNode !== null && newHeap.elem !== null) {
							setHeapNode(subheap.elem, subheap);
					}
					var pairingNode = new PairingHeap(newValue);
					if (setHeapNode !== null) {
							setHeapNode(newValue, pairingNode);
					}
					return this.merge(pairingNode, lessThan);
			};
			return PairingHeap;
	}());
	exports.PairingHeap = PairingHeap;
	var PriorityQueue = (function () {
			function PriorityQueue(lessThan) {
					this.lessThan = lessThan;
			}
			PriorityQueue.prototype.top = function () {
					if (this.empty()) {
							return null;
					}
					return this.root.elem;
			};
			PriorityQueue.prototype.push = function () {
					var args = [];
					for (var _i = 0; _i < arguments.length; _i++) {
							args[_i] = arguments[_i];
					}
					var pairingNode;
					for (var i = 0, arg; arg = args[i]; ++i) {
							pairingNode = new PairingHeap(arg);
							this.root = this.empty() ?
									pairingNode : this.root.merge(pairingNode, this.lessThan);
					}
					return pairingNode;
			};
			PriorityQueue.prototype.empty = function () {
					return !this.root || !this.root.elem;
			};
			PriorityQueue.prototype.isHeap = function () {
					return this.root.isHeap(this.lessThan);
			};
			PriorityQueue.prototype.forEach = function (f) {
					this.root.forEach(f);
			};
			PriorityQueue.prototype.pop = function () {
					if (this.empty()) {
							return null;
					}
					var obj = this.root.min();
					this.root = this.root.removeMin(this.lessThan);
					return obj;
			};
			PriorityQueue.prototype.reduceKey = function (heapNode, newKey, setHeapNode) {
					if (setHeapNode === void 0) { setHeapNode = null; }
					this.root = this.root.decreaseKey(heapNode, newKey, setHeapNode, this.lessThan);
			};
			PriorityQueue.prototype.toString = function (selector) {
					return this.root.toString(selector);
			};
			PriorityQueue.prototype.count = function () {
					return this.root.count();
			};
			return PriorityQueue;
	}());
	exports.PriorityQueue = PriorityQueue;
	
	},{}],16:[function(require,module,exports){
	"use strict";
	var __extends = (this && this.__extends) || (function () {
			var extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
			return function (d, b) {
					extendStatics(d, b);
					function __() { this.constructor = d; }
					d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var TreeBase = (function () {
			function TreeBase() {
					this.findIter = function (data) {
							var res = this._root;
							var iter = this.iterator();
							while (res !== null) {
									var c = this._comparator(data, res.data);
									if (c === 0) {
											iter._cursor = res;
											return iter;
									}
									else {
											iter._ancestors.push(res);
											res = res.get_child(c > 0);
									}
							}
							return null;
					};
			}
			TreeBase.prototype.clear = function () {
					this._root = null;
					this.size = 0;
			};
			;
			TreeBase.prototype.find = function (data) {
					var res = this._root;
					while (res !== null) {
							var c = this._comparator(data, res.data);
							if (c === 0) {
									return res.data;
							}
							else {
									res = res.get_child(c > 0);
							}
					}
					return null;
			};
			;
			TreeBase.prototype.lowerBound = function (data) {
					return this._bound(data, this._comparator);
			};
			;
			TreeBase.prototype.upperBound = function (data) {
					var cmp = this._comparator;
					function reverse_cmp(a, b) {
							return cmp(b, a);
					}
					return this._bound(data, reverse_cmp);
			};
			;
			TreeBase.prototype.min = function () {
					var res = this._root;
					if (res === null) {
							return null;
					}
					while (res.left !== null) {
							res = res.left;
					}
					return res.data;
			};
			;
			TreeBase.prototype.max = function () {
					var res = this._root;
					if (res === null) {
							return null;
					}
					while (res.right !== null) {
							res = res.right;
					}
					return res.data;
			};
			;
			TreeBase.prototype.iterator = function () {
					return new Iterator(this);
			};
			;
			TreeBase.prototype.each = function (cb) {
					var it = this.iterator(), data;
					while ((data = it.next()) !== null) {
							cb(data);
					}
			};
			;
			TreeBase.prototype.reach = function (cb) {
					var it = this.iterator(), data;
					while ((data = it.prev()) !== null) {
							cb(data);
					}
			};
			;
			TreeBase.prototype._bound = function (data, cmp) {
					var cur = this._root;
					var iter = this.iterator();
					while (cur !== null) {
							var c = this._comparator(data, cur.data);
							if (c === 0) {
									iter._cursor = cur;
									return iter;
							}
							iter._ancestors.push(cur);
							cur = cur.get_child(c > 0);
					}
					for (var i = iter._ancestors.length - 1; i >= 0; --i) {
							cur = iter._ancestors[i];
							if (cmp(data, cur.data) > 0) {
									iter._cursor = cur;
									iter._ancestors.length = i;
									return iter;
							}
					}
					iter._ancestors.length = 0;
					return iter;
			};
			;
			return TreeBase;
	}());
	exports.TreeBase = TreeBase;
	var Iterator = (function () {
			function Iterator(tree) {
					this._tree = tree;
					this._ancestors = [];
					this._cursor = null;
			}
			Iterator.prototype.data = function () {
					return this._cursor !== null ? this._cursor.data : null;
			};
			;
			Iterator.prototype.next = function () {
					if (this._cursor === null) {
							var root = this._tree._root;
							if (root !== null) {
									this._minNode(root);
							}
					}
					else {
							if (this._cursor.right === null) {
									var save;
									do {
											save = this._cursor;
											if (this._ancestors.length) {
													this._cursor = this._ancestors.pop();
											}
											else {
													this._cursor = null;
													break;
											}
									} while (this._cursor.right === save);
							}
							else {
									this._ancestors.push(this._cursor);
									this._minNode(this._cursor.right);
							}
					}
					return this._cursor !== null ? this._cursor.data : null;
			};
			;
			Iterator.prototype.prev = function () {
					if (this._cursor === null) {
							var root = this._tree._root;
							if (root !== null) {
									this._maxNode(root);
							}
					}
					else {
							if (this._cursor.left === null) {
									var save;
									do {
											save = this._cursor;
											if (this._ancestors.length) {
													this._cursor = this._ancestors.pop();
											}
											else {
													this._cursor = null;
													break;
											}
									} while (this._cursor.left === save);
							}
							else {
									this._ancestors.push(this._cursor);
									this._maxNode(this._cursor.left);
							}
					}
					return this._cursor !== null ? this._cursor.data : null;
			};
			;
			Iterator.prototype._minNode = function (start) {
					while (start.left !== null) {
							this._ancestors.push(start);
							start = start.left;
					}
					this._cursor = start;
			};
			;
			Iterator.prototype._maxNode = function (start) {
					while (start.right !== null) {
							this._ancestors.push(start);
							start = start.right;
					}
					this._cursor = start;
			};
			;
			return Iterator;
	}());
	exports.Iterator = Iterator;
	var Node = (function () {
			function Node(data) {
					this.data = data;
					this.left = null;
					this.right = null;
					this.red = true;
			}
			Node.prototype.get_child = function (dir) {
					return dir ? this.right : this.left;
			};
			;
			Node.prototype.set_child = function (dir, val) {
					if (dir) {
							this.right = val;
					}
					else {
							this.left = val;
					}
			};
			;
			return Node;
	}());
	var RBTree = (function (_super) {
			__extends(RBTree, _super);
			function RBTree(comparator) {
					var _this = _super.call(this) || this;
					_this._root = null;
					_this._comparator = comparator;
					_this.size = 0;
					return _this;
			}
			RBTree.prototype.insert = function (data) {
					var ret = false;
					if (this._root === null) {
							this._root = new Node(data);
							ret = true;
							this.size++;
					}
					else {
							var head = new Node(undefined);
							var dir = false;
							var last = false;
							var gp = null;
							var ggp = head;
							var p = null;
							var node = this._root;
							ggp.right = this._root;
							while (true) {
									if (node === null) {
											node = new Node(data);
											p.set_child(dir, node);
											ret = true;
											this.size++;
									}
									else if (RBTree.is_red(node.left) && RBTree.is_red(node.right)) {
											node.red = true;
											node.left.red = false;
											node.right.red = false;
									}
									if (RBTree.is_red(node) && RBTree.is_red(p)) {
											var dir2 = ggp.right === gp;
											if (node === p.get_child(last)) {
													ggp.set_child(dir2, RBTree.single_rotate(gp, !last));
											}
											else {
													ggp.set_child(dir2, RBTree.double_rotate(gp, !last));
											}
									}
									var cmp = this._comparator(node.data, data);
									if (cmp === 0) {
											break;
									}
									last = dir;
									dir = cmp < 0;
									if (gp !== null) {
											ggp = gp;
									}
									gp = p;
									p = node;
									node = node.get_child(dir);
							}
							this._root = head.right;
					}
					this._root.red = false;
					return ret;
			};
			;
			RBTree.prototype.remove = function (data) {
					if (this._root === null) {
							return false;
					}
					var head = new Node(undefined);
					var node = head;
					node.right = this._root;
					var p = null;
					var gp = null;
					var found = null;
					var dir = true;
					while (node.get_child(dir) !== null) {
							var last = dir;
							gp = p;
							p = node;
							node = node.get_child(dir);
							var cmp = this._comparator(data, node.data);
							dir = cmp > 0;
							if (cmp === 0) {
									found = node;
							}
							if (!RBTree.is_red(node) && !RBTree.is_red(node.get_child(dir))) {
									if (RBTree.is_red(node.get_child(!dir))) {
											var sr = RBTree.single_rotate(node, dir);
											p.set_child(last, sr);
											p = sr;
									}
									else if (!RBTree.is_red(node.get_child(!dir))) {
											var sibling = p.get_child(!last);
											if (sibling !== null) {
													if (!RBTree.is_red(sibling.get_child(!last)) && !RBTree.is_red(sibling.get_child(last))) {
															p.red = false;
															sibling.red = true;
															node.red = true;
													}
													else {
															var dir2 = gp.right === p;
															if (RBTree.is_red(sibling.get_child(last))) {
																	gp.set_child(dir2, RBTree.double_rotate(p, last));
															}
															else if (RBTree.is_red(sibling.get_child(!last))) {
																	gp.set_child(dir2, RBTree.single_rotate(p, last));
															}
															var gpc = gp.get_child(dir2);
															gpc.red = true;
															node.red = true;
															gpc.left.red = false;
															gpc.right.red = false;
													}
											}
									}
							}
					}
					if (found !== null) {
							found.data = node.data;
							p.set_child(p.right === node, node.get_child(node.left === null));
							this.size--;
					}
					this._root = head.right;
					if (this._root !== null) {
							this._root.red = false;
					}
					return found !== null;
			};
			;
			RBTree.is_red = function (node) {
					return node !== null && node.red;
			};
			RBTree.single_rotate = function (root, dir) {
					var save = root.get_child(!dir);
					root.set_child(!dir, save.get_child(dir));
					save.set_child(dir, root);
					root.red = true;
					save.red = false;
					return save;
			};
			RBTree.double_rotate = function (root, dir) {
					root.set_child(!dir, RBTree.single_rotate(root.get_child(!dir), !dir));
					return RBTree.single_rotate(root, dir);
			};
			return RBTree;
	}(TreeBase));
	exports.RBTree = RBTree;
	
	},{}],17:[function(require,module,exports){
	"use strict";
	var __extends = (this && this.__extends) || (function () {
			var extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
			return function (d, b) {
					extendStatics(d, b);
					function __() { this.constructor = d; }
					d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var vpsc_1 = require("./vpsc");
	var rbtree_1 = require("./rbtree");
	function computeGroupBounds(g) {
			g.bounds = typeof g.leaves !== "undefined" ?
					g.leaves.reduce(function (r, c) { return c.bounds.union(r); }, Rectangle.empty()) :
					Rectangle.empty();
			if (typeof g.groups !== "undefined")
					g.bounds = g.groups.reduce(function (r, c) { return computeGroupBounds(c).union(r); }, g.bounds);
			g.bounds = g.bounds.inflate(g.padding);
			return g.bounds;
	}
	exports.computeGroupBounds = computeGroupBounds;
	var Rectangle = (function () {
			function Rectangle(x, X, y, Y) {
					this.x = x;
					this.X = X;
					this.y = y;
					this.Y = Y;
			}
			Rectangle.empty = function () { return new Rectangle(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY); };
			Rectangle.prototype.cx = function () { return (this.x + this.X) / 2; };
			Rectangle.prototype.cy = function () { return (this.y + this.Y) / 2; };
			Rectangle.prototype.overlapX = function (r) {
					var ux = this.cx(), vx = r.cx();
					if (ux <= vx && r.x < this.X)
							return this.X - r.x;
					if (vx <= ux && this.x < r.X)
							return r.X - this.x;
					return 0;
			};
			Rectangle.prototype.overlapY = function (r) {
					var uy = this.cy(), vy = r.cy();
					if (uy <= vy && r.y < this.Y)
							return this.Y - r.y;
					if (vy <= uy && this.y < r.Y)
							return r.Y - this.y;
					return 0;
			};
			Rectangle.prototype.setXCentre = function (cx) {
					var dx = cx - this.cx();
					this.x += dx;
					this.X += dx;
			};
			Rectangle.prototype.setYCentre = function (cy) {
					var dy = cy - this.cy();
					this.y += dy;
					this.Y += dy;
			};
			Rectangle.prototype.width = function () {
					return this.X - this.x;
			};
			Rectangle.prototype.height = function () {
					return this.Y - this.y;
			};
			Rectangle.prototype.union = function (r) {
					return new Rectangle(Math.min(this.x, r.x), Math.max(this.X, r.X), Math.min(this.y, r.y), Math.max(this.Y, r.Y));
			};
			Rectangle.prototype.lineIntersections = function (x1, y1, x2, y2) {
					var sides = [[this.x, this.y, this.X, this.y],
							[this.X, this.y, this.X, this.Y],
							[this.X, this.Y, this.x, this.Y],
							[this.x, this.Y, this.x, this.y]];
					var intersections = [];
					for (var i = 0; i < 4; ++i) {
							var r = Rectangle.lineIntersection(x1, y1, x2, y2, sides[i][0], sides[i][1], sides[i][2], sides[i][3]);
							if (r !== null)
									intersections.push({ x: r.x, y: r.y });
					}
					return intersections;
			};
			Rectangle.prototype.rayIntersection = function (x2, y2) {
					var ints = this.lineIntersections(this.cx(), this.cy(), x2, y2);
					return ints.length > 0 ? ints[0] : null;
			};
			Rectangle.prototype.vertices = function () {
					return [
							{ x: this.x, y: this.y },
							{ x: this.X, y: this.y },
							{ x: this.X, y: this.Y },
							{ x: this.x, y: this.Y },
							{ x: this.x, y: this.y }
					];
			};
			Rectangle.lineIntersection = function (x1, y1, x2, y2, x3, y3, x4, y4) {
					var dx12 = x2 - x1, dx34 = x4 - x3, dy12 = y2 - y1, dy34 = y4 - y3, denominator = dy34 * dx12 - dx34 * dy12;
					if (denominator == 0)
							return null;
					var dx31 = x1 - x3, dy31 = y1 - y3, numa = dx34 * dy31 - dy34 * dx31, a = numa / denominator, numb = dx12 * dy31 - dy12 * dx31, b = numb / denominator;
					if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
							return {
									x: x1 + a * dx12,
									y: y1 + a * dy12
							};
					}
					return null;
			};
			Rectangle.prototype.inflate = function (pad) {
					return new Rectangle(this.x - pad, this.X + pad, this.y - pad, this.Y + pad);
			};
			return Rectangle;
	}());
	exports.Rectangle = Rectangle;
	function makeEdgeBetween(source, target, ah) {
			var si = source.rayIntersection(target.cx(), target.cy()) || { x: source.cx(), y: source.cy() }, ti = target.rayIntersection(source.cx(), source.cy()) || { x: target.cx(), y: target.cy() }, dx = ti.x - si.x, dy = ti.y - si.y, l = Math.sqrt(dx * dx + dy * dy), al = l - ah;
			return {
					sourceIntersection: si,
					targetIntersection: ti,
					arrowStart: { x: si.x + al * dx / l, y: si.y + al * dy / l }
			};
	}
	exports.makeEdgeBetween = makeEdgeBetween;
	function makeEdgeTo(s, target, ah) {
			var ti = target.rayIntersection(s.x, s.y);
			if (!ti)
					ti = { x: target.cx(), y: target.cy() };
			var dx = ti.x - s.x, dy = ti.y - s.y, l = Math.sqrt(dx * dx + dy * dy);
			return { x: ti.x - ah * dx / l, y: ti.y - ah * dy / l };
	}
	exports.makeEdgeTo = makeEdgeTo;
	var Node = (function () {
			function Node(v, r, pos) {
					this.v = v;
					this.r = r;
					this.pos = pos;
					this.prev = makeRBTree();
					this.next = makeRBTree();
			}
			return Node;
	}());
	var Event = (function () {
			function Event(isOpen, v, pos) {
					this.isOpen = isOpen;
					this.v = v;
					this.pos = pos;
			}
			return Event;
	}());
	function compareEvents(a, b) {
			if (a.pos > b.pos) {
					return 1;
			}
			if (a.pos < b.pos) {
					return -1;
			}
			if (a.isOpen) {
					return -1;
			}
			if (b.isOpen) {
					return 1;
			}
			return 0;
	}
	function makeRBTree() {
			return new rbtree_1.RBTree(function (a, b) { return a.pos - b.pos; });
	}
	var xRect = {
			getCentre: function (r) { return r.cx(); },
			getOpen: function (r) { return r.y; },
			getClose: function (r) { return r.Y; },
			getSize: function (r) { return r.width(); },
			makeRect: function (open, close, center, size) { return new Rectangle(center - size / 2, center + size / 2, open, close); },
			findNeighbours: findXNeighbours
	};
	var yRect = {
			getCentre: function (r) { return r.cy(); },
			getOpen: function (r) { return r.x; },
			getClose: function (r) { return r.X; },
			getSize: function (r) { return r.height(); },
			makeRect: function (open, close, center, size) { return new Rectangle(open, close, center - size / 2, center + size / 2); },
			findNeighbours: findYNeighbours
	};
	function generateGroupConstraints(root, f, minSep, isContained) {
			if (isContained === void 0) { isContained = false; }
			var padding = root.padding, gn = typeof root.groups !== 'undefined' ? root.groups.length : 0, ln = typeof root.leaves !== 'undefined' ? root.leaves.length : 0, childConstraints = !gn ? []
					: root.groups.reduce(function (ccs, g) { return ccs.concat(generateGroupConstraints(g, f, minSep, true)); }, []), n = (isContained ? 2 : 0) + ln + gn, vs = new Array(n), rs = new Array(n), i = 0, add = function (r, v) { rs[i] = r; vs[i++] = v; };
			if (isContained) {
					var b = root.bounds, c = f.getCentre(b), s = f.getSize(b) / 2, open = f.getOpen(b), close = f.getClose(b), min = c - s + padding / 2, max = c + s - padding / 2;
					root.minVar.desiredPosition = min;
					add(f.makeRect(open, close, min, padding), root.minVar);
					root.maxVar.desiredPosition = max;
					add(f.makeRect(open, close, max, padding), root.maxVar);
			}
			if (ln)
					root.leaves.forEach(function (l) { return add(l.bounds, l.variable); });
			if (gn)
					root.groups.forEach(function (g) {
							var b = g.bounds;
							add(f.makeRect(f.getOpen(b), f.getClose(b), f.getCentre(b), f.getSize(b)), g.minVar);
					});
			var cs = generateConstraints(rs, vs, f, minSep);
			if (gn) {
					vs.forEach(function (v) { v.cOut = [], v.cIn = []; });
					cs.forEach(function (c) { c.left.cOut.push(c), c.right.cIn.push(c); });
					root.groups.forEach(function (g) {
							var gapAdjustment = (g.padding - f.getSize(g.bounds)) / 2;
							g.minVar.cIn.forEach(function (c) { return c.gap += gapAdjustment; });
							g.minVar.cOut.forEach(function (c) { c.left = g.maxVar; c.gap += gapAdjustment; });
					});
			}
			return childConstraints.concat(cs);
	}
	function generateConstraints(rs, vars, rect, minSep) {
			var i, n = rs.length;
			var N = 2 * n;
			console.assert(vars.length >= n);
			var events = new Array(N);
			for (i = 0; i < n; ++i) {
					var r = rs[i];
					var v = new Node(vars[i], r, rect.getCentre(r));
					events[i] = new Event(true, v, rect.getOpen(r));
					events[i + n] = new Event(false, v, rect.getClose(r));
			}
			events.sort(compareEvents);
			var cs = new Array();
			var scanline = makeRBTree();
			for (i = 0; i < N; ++i) {
					var e = events[i];
					var v = e.v;
					if (e.isOpen) {
							scanline.insert(v);
							rect.findNeighbours(v, scanline);
					}
					else {
							scanline.remove(v);
							var makeConstraint = function (l, r) {
									var sep = (rect.getSize(l.r) + rect.getSize(r.r)) / 2 + minSep;
									cs.push(new vpsc_1.Constraint(l.v, r.v, sep));
							};
							var visitNeighbours = function (forward, reverse, mkcon) {
									var u, it = v[forward].iterator();
									while ((u = it[forward]()) !== null) {
											mkcon(u, v);
											u[reverse].remove(v);
									}
							};
							visitNeighbours("prev", "next", function (u, v) { return makeConstraint(u, v); });
							visitNeighbours("next", "prev", function (u, v) { return makeConstraint(v, u); });
					}
			}
			console.assert(scanline.size === 0);
			return cs;
	}
	function findXNeighbours(v, scanline) {
			var f = function (forward, reverse) {
					var it = scanline.findIter(v);
					var u;
					while ((u = it[forward]()) !== null) {
							var uovervX = u.r.overlapX(v.r);
							if (uovervX <= 0 || uovervX <= u.r.overlapY(v.r)) {
									v[forward].insert(u);
									u[reverse].insert(v);
							}
							if (uovervX <= 0) {
									break;
							}
					}
			};
			f("next", "prev");
			f("prev", "next");
	}
	function findYNeighbours(v, scanline) {
			var f = function (forward, reverse) {
					var u = scanline.findIter(v)[forward]();
					if (u !== null && u.r.overlapX(v.r) > 0) {
							v[forward].insert(u);
							u[reverse].insert(v);
					}
			};
			f("next", "prev");
			f("prev", "next");
	}
	function generateXConstraints(rs, vars) {
			return generateConstraints(rs, vars, xRect, 1e-6);
	}
	exports.generateXConstraints = generateXConstraints;
	function generateYConstraints(rs, vars) {
			return generateConstraints(rs, vars, yRect, 1e-6);
	}
	exports.generateYConstraints = generateYConstraints;
	function generateXGroupConstraints(root) {
			return generateGroupConstraints(root, xRect, 1e-6);
	}
	exports.generateXGroupConstraints = generateXGroupConstraints;
	function generateYGroupConstraints(root) {
			return generateGroupConstraints(root, yRect, 1e-6);
	}
	exports.generateYGroupConstraints = generateYGroupConstraints;
	function removeOverlaps(rs) {
			var vs = rs.map(function (r) { return new vpsc_1.Variable(r.cx()); });
			var cs = generateXConstraints(rs, vs);
			var solver = new vpsc_1.Solver(vs, cs);
			solver.solve();
			vs.forEach(function (v, i) { return rs[i].setXCentre(v.position()); });
			vs = rs.map(function (r) { return new vpsc_1.Variable(r.cy()); });
			cs = generateYConstraints(rs, vs);
			solver = new vpsc_1.Solver(vs, cs);
			solver.solve();
			vs.forEach(function (v, i) { return rs[i].setYCentre(v.position()); });
	}
	exports.removeOverlaps = removeOverlaps;
	var IndexedVariable = (function (_super) {
			__extends(IndexedVariable, _super);
			function IndexedVariable(index, w) {
					var _this = _super.call(this, 0, w) || this;
					_this.index = index;
					return _this;
			}
			return IndexedVariable;
	}(vpsc_1.Variable));
	exports.IndexedVariable = IndexedVariable;
	var Projection = (function () {
			function Projection(nodes, groups, rootGroup, constraints, avoidOverlaps) {
					if (rootGroup === void 0) { rootGroup = null; }
					if (constraints === void 0) { constraints = null; }
					if (avoidOverlaps === void 0) { avoidOverlaps = false; }
					var _this = this;
					this.nodes = nodes;
					this.groups = groups;
					this.rootGroup = rootGroup;
					this.avoidOverlaps = avoidOverlaps;
					this.variables = nodes.map(function (v, i) {
							return v.variable = new IndexedVariable(i, 1);
					});
					if (constraints)
							this.createConstraints(constraints);
					if (avoidOverlaps && rootGroup && typeof rootGroup.groups !== 'undefined') {
							nodes.forEach(function (v) {
									if (!v.width || !v.height) {
											v.bounds = new Rectangle(v.x, v.x, v.y, v.y);
											return;
									}
									var w2 = v.width / 2, h2 = v.height / 2;
									v.bounds = new Rectangle(v.x - w2, v.x + w2, v.y - h2, v.y + h2);
							});
							computeGroupBounds(rootGroup);
							var i = nodes.length;
							groups.forEach(function (g) {
									_this.variables[i] = g.minVar = new IndexedVariable(i++, typeof g.stiffness !== "undefined" ? g.stiffness : 0.01);
									_this.variables[i] = g.maxVar = new IndexedVariable(i++, typeof g.stiffness !== "undefined" ? g.stiffness : 0.01);
							});
					}
			}
			Projection.prototype.createSeparation = function (c) {
					return new vpsc_1.Constraint(this.nodes[c.left].variable, this.nodes[c.right].variable, c.gap, typeof c.equality !== "undefined" ? c.equality : false);
			};
			Projection.prototype.makeFeasible = function (c) {
					var _this = this;
					if (!this.avoidOverlaps)
							return;
					var axis = 'x', dim = 'width';
					if (c.axis === 'x')
							axis = 'y', dim = 'height';
					var vs = c.offsets.map(function (o) { return _this.nodes[o.node]; }).sort(function (a, b) { return a[axis] - b[axis]; });
					var p = null;
					vs.forEach(function (v) {
							if (p) {
									var nextPos = p[axis] + p[dim];
									if (nextPos > v[axis]) {
											v[axis] = nextPos;
									}
							}
							p = v;
					});
			};
			Projection.prototype.createAlignment = function (c) {
					var _this = this;
					var u = this.nodes[c.offsets[0].node].variable;
					this.makeFeasible(c);
					var cs = c.axis === 'x' ? this.xConstraints : this.yConstraints;
					c.offsets.slice(1).forEach(function (o) {
							var v = _this.nodes[o.node].variable;
							cs.push(new vpsc_1.Constraint(u, v, o.offset, true));
					});
			};
			Projection.prototype.createConstraints = function (constraints) {
					var _this = this;
					var isSep = function (c) { return typeof c.type === 'undefined' || c.type === 'separation'; };
					this.xConstraints = constraints
							.filter(function (c) { return c.axis === "x" && isSep(c); })
							.map(function (c) { return _this.createSeparation(c); });
					this.yConstraints = constraints
							.filter(function (c) { return c.axis === "y" && isSep(c); })
							.map(function (c) { return _this.createSeparation(c); });
					constraints
							.filter(function (c) { return c.type === 'alignment'; })
							.forEach(function (c) { return _this.createAlignment(c); });
			};
			Projection.prototype.setupVariablesAndBounds = function (x0, y0, desired, getDesired) {
					this.nodes.forEach(function (v, i) {
							if (v.fixed) {
									v.variable.weight = v.fixedWeight ? v.fixedWeight : 1000;
									desired[i] = getDesired(v);
							}
							else {
									v.variable.weight = 1;
							}
							var w = (v.width || 0) / 2, h = (v.height || 0) / 2;
							var ix = x0[i], iy = y0[i];
							v.bounds = new Rectangle(ix - w, ix + w, iy - h, iy + h);
					});
			};
			Projection.prototype.xProject = function (x0, y0, x) {
					if (!this.rootGroup && !(this.avoidOverlaps || this.xConstraints))
							return;
					this.project(x0, y0, x0, x, function (v) { return v.px; }, this.xConstraints, generateXGroupConstraints, function (v) { return v.bounds.setXCentre(x[v.variable.index] = v.variable.position()); }, function (g) {
							var xmin = x[g.minVar.index] = g.minVar.position();
							var xmax = x[g.maxVar.index] = g.maxVar.position();
							var p2 = g.padding / 2;
							g.bounds.x = xmin - p2;
							g.bounds.X = xmax + p2;
					});
			};
			Projection.prototype.yProject = function (x0, y0, y) {
					if (!this.rootGroup && !this.yConstraints)
							return;
					this.project(x0, y0, y0, y, function (v) { return v.py; }, this.yConstraints, generateYGroupConstraints, function (v) { return v.bounds.setYCentre(y[v.variable.index] = v.variable.position()); }, function (g) {
							var ymin = y[g.minVar.index] = g.minVar.position();
							var ymax = y[g.maxVar.index] = g.maxVar.position();
							var p2 = g.padding / 2;
							g.bounds.y = ymin - p2;
							;
							g.bounds.Y = ymax + p2;
					});
			};
			Projection.prototype.projectFunctions = function () {
					var _this = this;
					return [
							function (x0, y0, x) { return _this.xProject(x0, y0, x); },
							function (x0, y0, y) { return _this.yProject(x0, y0, y); }
					];
			};
			Projection.prototype.project = function (x0, y0, start, desired, getDesired, cs, generateConstraints, updateNodeBounds, updateGroupBounds) {
					this.setupVariablesAndBounds(x0, y0, desired, getDesired);
					if (this.rootGroup && this.avoidOverlaps) {
							computeGroupBounds(this.rootGroup);
							cs = cs.concat(generateConstraints(this.rootGroup));
					}
					this.solve(this.variables, cs, start, desired);
					this.nodes.forEach(updateNodeBounds);
					if (this.rootGroup && this.avoidOverlaps) {
							this.groups.forEach(updateGroupBounds);
							computeGroupBounds(this.rootGroup);
					}
			};
			Projection.prototype.solve = function (vs, cs, starting, desired) {
					var solver = new vpsc_1.Solver(vs, cs);
					solver.setStartingPositions(starting);
					solver.setDesiredPositions(desired);
					solver.solve();
			};
			return Projection;
	}());
	exports.Projection = Projection;
	
	},{"./rbtree":16,"./vpsc":19}],18:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var pqueue_1 = require("./pqueue");
	var Neighbour = (function () {
			function Neighbour(id, distance) {
					this.id = id;
					this.distance = distance;
			}
			return Neighbour;
	}());
	var Node = (function () {
			function Node(id) {
					this.id = id;
					this.neighbours = [];
			}
			return Node;
	}());
	var QueueEntry = (function () {
			function QueueEntry(node, prev, d) {
					this.node = node;
					this.prev = prev;
					this.d = d;
			}
			return QueueEntry;
	}());
	var Calculator = (function () {
			function Calculator(n, es, getSourceIndex, getTargetIndex, getLength) {
					this.n = n;
					this.es = es;
					this.neighbours = new Array(this.n);
					var i = this.n;
					while (i--)
							this.neighbours[i] = new Node(i);
					i = this.es.length;
					while (i--) {
							var e = this.es[i];
							var u = getSourceIndex(e), v = getTargetIndex(e);
							var d = getLength(e);
							this.neighbours[u].neighbours.push(new Neighbour(v, d));
							this.neighbours[v].neighbours.push(new Neighbour(u, d));
					}
			}
			Calculator.prototype.DistanceMatrix = function () {
					var D = new Array(this.n);
					for (var i = 0; i < this.n; ++i) {
							D[i] = this.dijkstraNeighbours(i);
					}
					return D;
			};
			Calculator.prototype.DistancesFromNode = function (start) {
					return this.dijkstraNeighbours(start);
			};
			Calculator.prototype.PathFromNodeToNode = function (start, end) {
					return this.dijkstraNeighbours(start, end);
			};
			Calculator.prototype.PathFromNodeToNodeWithPrevCost = function (start, end, prevCost) {
					var q = new pqueue_1.PriorityQueue(function (a, b) { return a.d <= b.d; }), u = this.neighbours[start], qu = new QueueEntry(u, null, 0), visitedFrom = {};
					q.push(qu);
					while (!q.empty()) {
							qu = q.pop();
							u = qu.node;
							if (u.id === end) {
									break;
							}
							var i = u.neighbours.length;
							while (i--) {
									var neighbour = u.neighbours[i], v = this.neighbours[neighbour.id];
									if (qu.prev && v.id === qu.prev.node.id)
											continue;
									var viduid = v.id + ',' + u.id;
									if (viduid in visitedFrom && visitedFrom[viduid] <= qu.d)
											continue;
									var cc = qu.prev ? prevCost(qu.prev.node.id, u.id, v.id) : 0, t = qu.d + neighbour.distance + cc;
									visitedFrom[viduid] = t;
									q.push(new QueueEntry(v, qu, t));
							}
					}
					var path = [];
					while (qu.prev) {
							qu = qu.prev;
							path.push(qu.node.id);
					}
					return path;
			};
			Calculator.prototype.dijkstraNeighbours = function (start, dest) {
					if (dest === void 0) { dest = -1; }
					var q = new pqueue_1.PriorityQueue(function (a, b) { return a.d <= b.d; }), i = this.neighbours.length, d = new Array(i);
					while (i--) {
							var node = this.neighbours[i];
							node.d = i === start ? 0 : Number.POSITIVE_INFINITY;
							node.q = q.push(node);
					}
					while (!q.empty()) {
							var u = q.pop();
							d[u.id] = u.d;
							if (u.id === dest) {
									var path = [];
									var v = u;
									while (typeof v.prev !== 'undefined') {
											path.push(v.prev.id);
											v = v.prev;
									}
									return path;
							}
							i = u.neighbours.length;
							while (i--) {
									var neighbour = u.neighbours[i];
									var v = this.neighbours[neighbour.id];
									var t = u.d + neighbour.distance;
									if (u.d !== Number.MAX_VALUE && v.d > t) {
											v.d = t;
											v.prev = u;
											q.reduceKey(v.q, v, function (e, q) { return e.q = q; });
									}
							}
					}
					return d;
			};
			return Calculator;
	}());
	exports.Calculator = Calculator;
	
	},{"./pqueue":15}],19:[function(require,module,exports){
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var PositionStats = (function () {
			function PositionStats(scale) {
					this.scale = scale;
					this.AB = 0;
					this.AD = 0;
					this.A2 = 0;
			}
			PositionStats.prototype.addVariable = function (v) {
					var ai = this.scale / v.scale;
					var bi = v.offset / v.scale;
					var wi = v.weight;
					this.AB += wi * ai * bi;
					this.AD += wi * ai * v.desiredPosition;
					this.A2 += wi * ai * ai;
			};
			PositionStats.prototype.getPosn = function () {
					return (this.AD - this.AB) / this.A2;
			};
			return PositionStats;
	}());
	exports.PositionStats = PositionStats;
	var Constraint = (function () {
			function Constraint(left, right, gap, equality) {
					if (equality === void 0) { equality = false; }
					this.left = left;
					this.right = right;
					this.gap = gap;
					this.equality = equality;
					this.active = false;
					this.unsatisfiable = false;
					this.left = left;
					this.right = right;
					this.gap = gap;
					this.equality = equality;
			}
			Constraint.prototype.slack = function () {
					return this.unsatisfiable ? Number.MAX_VALUE
							: this.right.scale * this.right.position() - this.gap
									- this.left.scale * this.left.position();
			};
			return Constraint;
	}());
	exports.Constraint = Constraint;
	var Variable = (function () {
			function Variable(desiredPosition, weight, scale) {
					if (weight === void 0) { weight = 1; }
					if (scale === void 0) { scale = 1; }
					this.desiredPosition = desiredPosition;
					this.weight = weight;
					this.scale = scale;
					this.offset = 0;
			}
			Variable.prototype.dfdv = function () {
					return 2.0 * this.weight * (this.position() - this.desiredPosition);
			};
			Variable.prototype.position = function () {
					return (this.block.ps.scale * this.block.posn + this.offset) / this.scale;
			};
			Variable.prototype.visitNeighbours = function (prev, f) {
					var ff = function (c, next) { return c.active && prev !== next && f(c, next); };
					this.cOut.forEach(function (c) { return ff(c, c.right); });
					this.cIn.forEach(function (c) { return ff(c, c.left); });
			};
			return Variable;
	}());
	exports.Variable = Variable;
	var Block = (function () {
			function Block(v) {
					this.vars = [];
					v.offset = 0;
					this.ps = new PositionStats(v.scale);
					this.addVariable(v);
			}
			Block.prototype.addVariable = function (v) {
					v.block = this;
					this.vars.push(v);
					this.ps.addVariable(v);
					this.posn = this.ps.getPosn();
			};
			Block.prototype.updateWeightedPosition = function () {
					this.ps.AB = this.ps.AD = this.ps.A2 = 0;
					for (var i = 0, n = this.vars.length; i < n; ++i)
							this.ps.addVariable(this.vars[i]);
					this.posn = this.ps.getPosn();
			};
			Block.prototype.compute_lm = function (v, u, postAction) {
					var _this = this;
					var dfdv = v.dfdv();
					v.visitNeighbours(u, function (c, next) {
							var _dfdv = _this.compute_lm(next, v, postAction);
							if (next === c.right) {
									dfdv += _dfdv * c.left.scale;
									c.lm = _dfdv;
							}
							else {
									dfdv += _dfdv * c.right.scale;
									c.lm = -_dfdv;
							}
							postAction(c);
					});
					return dfdv / v.scale;
			};
			Block.prototype.populateSplitBlock = function (v, prev) {
					var _this = this;
					v.visitNeighbours(prev, function (c, next) {
							next.offset = v.offset + (next === c.right ? c.gap : -c.gap);
							_this.addVariable(next);
							_this.populateSplitBlock(next, v);
					});
			};
			Block.prototype.traverse = function (visit, acc, v, prev) {
					var _this = this;
					if (v === void 0) { v = this.vars[0]; }
					if (prev === void 0) { prev = null; }
					v.visitNeighbours(prev, function (c, next) {
							acc.push(visit(c));
							_this.traverse(visit, acc, next, v);
					});
			};
			Block.prototype.findMinLM = function () {
					var m = null;
					this.compute_lm(this.vars[0], null, function (c) {
							if (!c.equality && (m === null || c.lm < m.lm))
									m = c;
					});
					return m;
			};
			Block.prototype.findMinLMBetween = function (lv, rv) {
					this.compute_lm(lv, null, function () { });
					var m = null;
					this.findPath(lv, null, rv, function (c, next) {
							if (!c.equality && c.right === next && (m === null || c.lm < m.lm))
									m = c;
					});
					return m;
			};
			Block.prototype.findPath = function (v, prev, to, visit) {
					var _this = this;
					var endFound = false;
					v.visitNeighbours(prev, function (c, next) {
							if (!endFound && (next === to || _this.findPath(next, v, to, visit))) {
									endFound = true;
									visit(c, next);
							}
					});
					return endFound;
			};
			Block.prototype.isActiveDirectedPathBetween = function (u, v) {
					if (u === v)
							return true;
					var i = u.cOut.length;
					while (i--) {
							var c = u.cOut[i];
							if (c.active && this.isActiveDirectedPathBetween(c.right, v))
									return true;
					}
					return false;
			};
			Block.split = function (c) {
					c.active = false;
					return [Block.createSplitBlock(c.left), Block.createSplitBlock(c.right)];
			};
			Block.createSplitBlock = function (startVar) {
					var b = new Block(startVar);
					b.populateSplitBlock(startVar, null);
					return b;
			};
			Block.prototype.splitBetween = function (vl, vr) {
					var c = this.findMinLMBetween(vl, vr);
					if (c !== null) {
							var bs = Block.split(c);
							return { constraint: c, lb: bs[0], rb: bs[1] };
					}
					return null;
			};
			Block.prototype.mergeAcross = function (b, c, dist) {
					c.active = true;
					for (var i = 0, n = b.vars.length; i < n; ++i) {
							var v = b.vars[i];
							v.offset += dist;
							this.addVariable(v);
					}
					this.posn = this.ps.getPosn();
			};
			Block.prototype.cost = function () {
					var sum = 0, i = this.vars.length;
					while (i--) {
							var v = this.vars[i], d = v.position() - v.desiredPosition;
							sum += d * d * v.weight;
					}
					return sum;
			};
			return Block;
	}());
	exports.Block = Block;
	var Blocks = (function () {
			function Blocks(vs) {
					this.vs = vs;
					var n = vs.length;
					this.list = new Array(n);
					while (n--) {
							var b = new Block(vs[n]);
							this.list[n] = b;
							b.blockInd = n;
					}
			}
			Blocks.prototype.cost = function () {
					var sum = 0, i = this.list.length;
					while (i--)
							sum += this.list[i].cost();
					return sum;
			};
			Blocks.prototype.insert = function (b) {
					b.blockInd = this.list.length;
					this.list.push(b);
			};
			Blocks.prototype.remove = function (b) {
					var last = this.list.length - 1;
					var swapBlock = this.list[last];
					this.list.length = last;
					if (b !== swapBlock) {
							this.list[b.blockInd] = swapBlock;
							swapBlock.blockInd = b.blockInd;
					}
			};
			Blocks.prototype.merge = function (c) {
					var l = c.left.block, r = c.right.block;
					var dist = c.right.offset - c.left.offset - c.gap;
					if (l.vars.length < r.vars.length) {
							r.mergeAcross(l, c, dist);
							this.remove(l);
					}
					else {
							l.mergeAcross(r, c, -dist);
							this.remove(r);
					}
			};
			Blocks.prototype.forEach = function (f) {
					this.list.forEach(f);
			};
			Blocks.prototype.updateBlockPositions = function () {
					this.list.forEach(function (b) { return b.updateWeightedPosition(); });
			};
			Blocks.prototype.split = function (inactive) {
					var _this = this;
					this.updateBlockPositions();
					this.list.forEach(function (b) {
							var v = b.findMinLM();
							if (v !== null && v.lm < Solver.LAGRANGIAN_TOLERANCE) {
									b = v.left.block;
									Block.split(v).forEach(function (nb) { return _this.insert(nb); });
									_this.remove(b);
									inactive.push(v);
							}
					});
			};
			return Blocks;
	}());
	exports.Blocks = Blocks;
	var Solver = (function () {
			function Solver(vs, cs) {
					this.vs = vs;
					this.cs = cs;
					this.vs = vs;
					vs.forEach(function (v) {
							v.cIn = [], v.cOut = [];
					});
					this.cs = cs;
					cs.forEach(function (c) {
							c.left.cOut.push(c);
							c.right.cIn.push(c);
					});
					this.inactive = cs.map(function (c) { c.active = false; return c; });
					this.bs = null;
			}
			Solver.prototype.cost = function () {
					return this.bs.cost();
			};
			Solver.prototype.setStartingPositions = function (ps) {
					this.inactive = this.cs.map(function (c) { c.active = false; return c; });
					this.bs = new Blocks(this.vs);
					this.bs.forEach(function (b, i) { return b.posn = ps[i]; });
			};
			Solver.prototype.setDesiredPositions = function (ps) {
					this.vs.forEach(function (v, i) { return v.desiredPosition = ps[i]; });
			};
			Solver.prototype.mostViolated = function () {
					var minSlack = Number.MAX_VALUE, v = null, l = this.inactive, n = l.length, deletePoint = n;
					for (var i = 0; i < n; ++i) {
							var c = l[i];
							if (c.unsatisfiable)
									continue;
							var slack = c.slack();
							if (c.equality || slack < minSlack) {
									minSlack = slack;
									v = c;
									deletePoint = i;
									if (c.equality)
											break;
							}
					}
					if (deletePoint !== n &&
							(minSlack < Solver.ZERO_UPPERBOUND && !v.active || v.equality)) {
							l[deletePoint] = l[n - 1];
							l.length = n - 1;
					}
					return v;
			};
			Solver.prototype.satisfy = function () {
					if (this.bs == null) {
							this.bs = new Blocks(this.vs);
					}
					this.bs.split(this.inactive);
					var v = null;
					while ((v = this.mostViolated()) && (v.equality || v.slack() < Solver.ZERO_UPPERBOUND && !v.active)) {
							var lb = v.left.block, rb = v.right.block;
							if (lb !== rb) {
									this.bs.merge(v);
							}
							else {
									if (lb.isActiveDirectedPathBetween(v.right, v.left)) {
											v.unsatisfiable = true;
											continue;
									}
									var split = lb.splitBetween(v.left, v.right);
									if (split !== null) {
											this.bs.insert(split.lb);
											this.bs.insert(split.rb);
											this.bs.remove(lb);
											this.inactive.push(split.constraint);
									}
									else {
											v.unsatisfiable = true;
											continue;
									}
									if (v.slack() >= 0) {
											this.inactive.push(v);
									}
									else {
											this.bs.merge(v);
									}
							}
					}
			};
			Solver.prototype.solve = function () {
					this.satisfy();
					var lastcost = Number.MAX_VALUE, cost = this.bs.cost();
					while (Math.abs(lastcost - cost) > 0.0001) {
							this.satisfy();
							lastcost = cost;
							cost = this.bs.cost();
					}
					return cost;
			};
			return Solver;
	}());
	Solver.LAGRANGIAN_TOLERANCE = -1e-4;
	Solver.ZERO_UPPERBOUND = -1e-10;
	exports.Solver = Solver;
	function removeOverlapInOneDimension(spans, lowerBound, upperBound) {
			var vs = spans.map(function (s) { return new Variable(s.desiredCenter); });
			var cs = [];
			var n = spans.length;
			for (var i = 0; i < n - 1; i++) {
					var left = spans[i], right = spans[i + 1];
					cs.push(new Constraint(vs[i], vs[i + 1], (left.size + right.size) / 2));
			}
			var leftMost = vs[0], rightMost = vs[n - 1], leftMostSize = spans[0].size / 2, rightMostSize = spans[n - 1].size / 2;
			var vLower = null, vUpper = null;
			if (lowerBound) {
					vLower = new Variable(lowerBound, leftMost.weight * 1000);
					vs.push(vLower);
					cs.push(new Constraint(vLower, leftMost, leftMostSize));
			}
			if (upperBound) {
					vUpper = new Variable(upperBound, rightMost.weight * 1000);
					vs.push(vUpper);
					cs.push(new Constraint(rightMost, vUpper, rightMostSize));
			}
			var solver = new Solver(vs, cs);
			solver.solve();
			return {
					newCenters: vs.slice(0, spans.length).map(function (v) { return v.position(); }),
					lowerBound: vLower ? vLower.position() : leftMost.position() - leftMostSize,
					upperBound: vUpper ? vUpper.position() : rightMost.position() + rightMostSize
			};
	}
	exports.removeOverlapInOneDimension = removeOverlapInOneDimension;
	
	},{}]},{},[1])(1)
	});
	//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2luZGV4LmpzIiwiZGlzdC9zcmMvYWRhcHRvci5qcyIsImRpc3Qvc3JjL2JhdGNoLmpzIiwiZGlzdC9zcmMvZDNhZGFwdG9yLmpzIiwiZGlzdC9zcmMvZDN2M2FkYXB0b3IuanMiLCJkaXN0L3NyYy9kM3Y0YWRhcHRvci5qcyIsImRpc3Qvc3JjL2Rlc2NlbnQuanMiLCJkaXN0L3NyYy9nZW9tLmpzIiwiZGlzdC9zcmMvZ3JpZHJvdXRlci5qcyIsImRpc3Qvc3JjL2hhbmRsZWRpc2Nvbm5lY3RlZC5qcyIsImRpc3Qvc3JjL2xheW91dC5qcyIsImRpc3Qvc3JjL2xheW91dDNkLmpzIiwiZGlzdC9zcmMvbGlua2xlbmd0aHMuanMiLCJkaXN0L3NyYy9wb3dlcmdyYXBoLmpzIiwiZGlzdC9zcmMvcHF1ZXVlLmpzIiwiZGlzdC9zcmMvcmJ0cmVlLmpzIiwiZGlzdC9zcmMvcmVjdGFuZ2xlLmpzIiwiZGlzdC9zcmMvc2hvcnRlc3RwYXRocy5qcyIsImRpc3Qvc3JjL3Zwc2MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gX19leHBvcnQobSkge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2FkYXB0b3JcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvZDNhZGFwdG9yXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2Rlc2NlbnRcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvZ2VvbVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9ncmlkcm91dGVyXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2hhbmRsZWRpc2Nvbm5lY3RlZFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9sYXlvdXRcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvbGF5b3V0M2RcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvbGlua2xlbmd0aHNcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvcG93ZXJncmFwaFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9wcXVldWVcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvcmJ0cmVlXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL3JlY3RhbmdsZVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9zaG9ydGVzdHBhdGhzXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL3Zwc2NcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvYmF0Y2hcIikpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGxheW91dF8xID0gcmVxdWlyZShcIi4vbGF5b3V0XCIpO1xyXG52YXIgTGF5b3V0QWRhcHRvciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoTGF5b3V0QWRhcHRvciwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIExheW91dEFkYXB0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbGYgPSBfdGhpcztcclxuICAgICAgICB2YXIgbyA9IG9wdGlvbnM7XHJcbiAgICAgICAgaWYgKG8udHJpZ2dlcikge1xyXG4gICAgICAgICAgICBfdGhpcy50cmlnZ2VyID0gby50cmlnZ2VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoby5raWNrKSB7XHJcbiAgICAgICAgICAgIF90aGlzLmtpY2sgPSBvLmtpY2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvLmRyYWcpIHtcclxuICAgICAgICAgICAgX3RoaXMuZHJhZyA9IG8uZHJhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG8ub24pIHtcclxuICAgICAgICAgICAgX3RoaXMub24gPSBvLm9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBfdGhpcy5kcmFnc3RhcnQgPSBfdGhpcy5kcmFnU3RhcnQgPSBsYXlvdXRfMS5MYXlvdXQuZHJhZ1N0YXJ0O1xyXG4gICAgICAgIF90aGlzLmRyYWdlbmQgPSBfdGhpcy5kcmFnRW5kID0gbGF5b3V0XzEuTGF5b3V0LmRyYWdFbmQ7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgTGF5b3V0QWRhcHRvci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7IH07XHJcbiAgICA7XHJcbiAgICBMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS5raWNrID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgO1xyXG4gICAgTGF5b3V0QWRhcHRvci5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uICgpIHsgfTtcclxuICAgIDtcclxuICAgIExheW91dEFkYXB0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHsgcmV0dXJuIHRoaXM7IH07XHJcbiAgICA7XHJcbiAgICByZXR1cm4gTGF5b3V0QWRhcHRvcjtcclxufShsYXlvdXRfMS5MYXlvdXQpKTtcclxuZXhwb3J0cy5MYXlvdXRBZGFwdG9yID0gTGF5b3V0QWRhcHRvcjtcclxuZnVuY3Rpb24gYWRhcHRvcihvcHRpb25zKSB7XHJcbiAgICByZXR1cm4gbmV3IExheW91dEFkYXB0b3Iob3B0aW9ucyk7XHJcbn1cclxuZXhwb3J0cy5hZGFwdG9yID0gYWRhcHRvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YWRhcHRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbGF5b3V0XzEgPSByZXF1aXJlKFwiLi9sYXlvdXRcIik7XHJcbnZhciBncmlkcm91dGVyXzEgPSByZXF1aXJlKFwiLi9ncmlkcm91dGVyXCIpO1xyXG5mdW5jdGlvbiBncmlkaWZ5KHBnTGF5b3V0LCBudWRnZUdhcCwgbWFyZ2luLCBncm91cE1hcmdpbikge1xyXG4gICAgcGdMYXlvdXQuY29sYS5zdGFydCgwLCAwLCAwLCAxMCwgZmFsc2UpO1xyXG4gICAgdmFyIGdyaWRyb3V0ZXIgPSByb3V0ZShwZ0xheW91dC5jb2xhLm5vZGVzKCksIHBnTGF5b3V0LmNvbGEuZ3JvdXBzKCksIG1hcmdpbiwgZ3JvdXBNYXJnaW4pO1xyXG4gICAgcmV0dXJuIGdyaWRyb3V0ZXIucm91dGVFZGdlcyhwZ0xheW91dC5wb3dlckdyYXBoLnBvd2VyRWRnZXMsIG51ZGdlR2FwLCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5zb3VyY2Uucm91dGVyTm9kZS5pZDsgfSwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0LnJvdXRlck5vZGUuaWQ7IH0pO1xyXG59XHJcbmV4cG9ydHMuZ3JpZGlmeSA9IGdyaWRpZnk7XHJcbmZ1bmN0aW9uIHJvdXRlKG5vZGVzLCBncm91cHMsIG1hcmdpbiwgZ3JvdXBNYXJnaW4pIHtcclxuICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBkLnJvdXRlck5vZGUgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IGQubmFtZSxcclxuICAgICAgICAgICAgYm91bmRzOiBkLmJvdW5kcy5pbmZsYXRlKC1tYXJnaW4pXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBkLnJvdXRlck5vZGUgPSB7XHJcbiAgICAgICAgICAgIGJvdW5kczogZC5ib3VuZHMuaW5mbGF0ZSgtZ3JvdXBNYXJnaW4pLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogKHR5cGVvZiBkLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcgPyBkLmdyb3Vwcy5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIG5vZGVzLmxlbmd0aCArIGMuaWQ7IH0pIDogW10pXHJcbiAgICAgICAgICAgICAgICAuY29uY2F0KHR5cGVvZiBkLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcgPyBkLmxlYXZlcy5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMuaW5kZXg7IH0pIDogW10pXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgdmFyIGdyaWRSb3V0ZXJOb2RlcyA9IG5vZGVzLmNvbmNhdChncm91cHMpLm1hcChmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgIGQucm91dGVyTm9kZS5pZCA9IGk7XHJcbiAgICAgICAgcmV0dXJuIGQucm91dGVyTm9kZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBncmlkcm91dGVyXzEuR3JpZFJvdXRlcihncmlkUm91dGVyTm9kZXMsIHtcclxuICAgICAgICBnZXRDaGlsZHJlbjogZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYuY2hpbGRyZW47IH0sXHJcbiAgICAgICAgZ2V0Qm91bmRzOiBmdW5jdGlvbiAodikgeyByZXR1cm4gdi5ib3VuZHM7IH1cclxuICAgIH0sIG1hcmdpbiAtIGdyb3VwTWFyZ2luKTtcclxufVxyXG5mdW5jdGlvbiBwb3dlckdyYXBoR3JpZExheW91dChncmFwaCwgc2l6ZSwgZ3JvdXBwYWRkaW5nKSB7XHJcbiAgICB2YXIgcG93ZXJHcmFwaDtcclxuICAgIGdyYXBoLm5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIHYuaW5kZXggPSBpOyB9KTtcclxuICAgIG5ldyBsYXlvdXRfMS5MYXlvdXQoKVxyXG4gICAgICAgIC5hdm9pZE92ZXJsYXBzKGZhbHNlKVxyXG4gICAgICAgIC5ub2RlcyhncmFwaC5ub2RlcylcclxuICAgICAgICAubGlua3MoZ3JhcGgubGlua3MpXHJcbiAgICAgICAgLnBvd2VyR3JhcGhHcm91cHMoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBwb3dlckdyYXBoID0gZDtcclxuICAgICAgICBwb3dlckdyYXBoLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnBhZGRpbmcgPSBncm91cHBhZGRpbmc7IH0pO1xyXG4gICAgfSk7XHJcbiAgICB2YXIgbiA9IGdyYXBoLm5vZGVzLmxlbmd0aDtcclxuICAgIHZhciBlZGdlcyA9IFtdO1xyXG4gICAgdmFyIHZzID0gZ3JhcGgubm9kZXMuc2xpY2UoMCk7XHJcbiAgICB2cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiB2LmluZGV4ID0gaTsgfSk7XHJcbiAgICBwb3dlckdyYXBoLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgdmFyIHNvdXJjZUluZCA9IGcuaW5kZXggPSBnLmlkICsgbjtcclxuICAgICAgICB2cy5wdXNoKGcpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZy5sZWF2ZXMgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICBnLmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiBlZGdlcy5wdXNoKHsgc291cmNlOiBzb3VyY2VJbmQsIHRhcmdldDogdi5pbmRleCB9KTsgfSk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBnLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgIGcuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGdnKSB7IHJldHVybiBlZGdlcy5wdXNoKHsgc291cmNlOiBzb3VyY2VJbmQsIHRhcmdldDogZ2cuaWQgKyBuIH0pOyB9KTtcclxuICAgIH0pO1xyXG4gICAgcG93ZXJHcmFwaC5wb3dlckVkZ2VzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlZGdlcy5wdXNoKHsgc291cmNlOiBlLnNvdXJjZS5pbmRleCwgdGFyZ2V0OiBlLnRhcmdldC5pbmRleCB9KTtcclxuICAgIH0pO1xyXG4gICAgbmV3IGxheW91dF8xLkxheW91dCgpXHJcbiAgICAgICAgLnNpemUoc2l6ZSlcclxuICAgICAgICAubm9kZXModnMpXHJcbiAgICAgICAgLmxpbmtzKGVkZ2VzKVxyXG4gICAgICAgIC5hdm9pZE92ZXJsYXBzKGZhbHNlKVxyXG4gICAgICAgIC5saW5rRGlzdGFuY2UoMzApXHJcbiAgICAgICAgLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3Rocyg1KVxyXG4gICAgICAgIC5jb252ZXJnZW5jZVRocmVzaG9sZCgxZS00KVxyXG4gICAgICAgIC5zdGFydCgxMDAsIDAsIDAsIDAsIGZhbHNlKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sYTogbmV3IGxheW91dF8xLkxheW91dCgpXHJcbiAgICAgICAgICAgIC5jb252ZXJnZW5jZVRocmVzaG9sZCgxZS0zKVxyXG4gICAgICAgICAgICAuc2l6ZShzaXplKVxyXG4gICAgICAgICAgICAuYXZvaWRPdmVybGFwcyh0cnVlKVxyXG4gICAgICAgICAgICAubm9kZXMoZ3JhcGgubm9kZXMpXHJcbiAgICAgICAgICAgIC5saW5rcyhncmFwaC5saW5rcylcclxuICAgICAgICAgICAgLmdyb3VwQ29tcGFjdG5lc3MoMWUtNClcclxuICAgICAgICAgICAgLmxpbmtEaXN0YW5jZSgzMClcclxuICAgICAgICAgICAgLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3Rocyg1KVxyXG4gICAgICAgICAgICAucG93ZXJHcmFwaEdyb3VwcyhmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICBwb3dlckdyYXBoID0gZDtcclxuICAgICAgICAgICAgcG93ZXJHcmFwaC5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgdi5wYWRkaW5nID0gZ3JvdXBwYWRkaW5nO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KS5zdGFydCg1MCwgMCwgMTAwLCAwLCBmYWxzZSksXHJcbiAgICAgICAgcG93ZXJHcmFwaDogcG93ZXJHcmFwaFxyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLnBvd2VyR3JhcGhHcmlkTGF5b3V0ID0gcG93ZXJHcmFwaEdyaWRMYXlvdXQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJhdGNoLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBkM3YzID0gcmVxdWlyZShcIi4vZDN2M2FkYXB0b3JcIik7XHJcbnZhciBkM3Y0ID0gcmVxdWlyZShcIi4vZDN2NGFkYXB0b3JcIik7XHJcbjtcclxuZnVuY3Rpb24gZDNhZGFwdG9yKGQzQ29udGV4dCkge1xyXG4gICAgaWYgKCFkM0NvbnRleHQgfHwgaXNEM1YzKGQzQ29udGV4dCkpIHtcclxuICAgICAgICByZXR1cm4gbmV3IGQzdjMuRDNTdHlsZUxheW91dEFkYXB0b3IoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgZDN2NC5EM1N0eWxlTGF5b3V0QWRhcHRvcihkM0NvbnRleHQpO1xyXG59XHJcbmV4cG9ydHMuZDNhZGFwdG9yID0gZDNhZGFwdG9yO1xyXG5mdW5jdGlvbiBpc0QzVjMoZDNDb250ZXh0KSB7XHJcbiAgICB2YXIgdjNleHAgPSAvXjNcXC4vO1xyXG4gICAgcmV0dXJuIGQzQ29udGV4dC52ZXJzaW9uICYmIGQzQ29udGV4dC52ZXJzaW9uLm1hdGNoKHYzZXhwKSAhPT0gbnVsbDtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kM2FkYXB0b3IuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsYXlvdXRfMSA9IHJlcXVpcmUoXCIuL2xheW91dFwiKTtcclxudmFyIEQzU3R5bGVMYXlvdXRBZGFwdG9yID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhEM1N0eWxlTGF5b3V0QWRhcHRvciwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIEQzU3R5bGVMYXlvdXRBZGFwdG9yKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuZXZlbnQgPSBkMy5kaXNwYXRjaChsYXlvdXRfMS5FdmVudFR5cGVbbGF5b3V0XzEuRXZlbnRUeXBlLnN0YXJ0XSwgbGF5b3V0XzEuRXZlbnRUeXBlW2xheW91dF8xLkV2ZW50VHlwZS50aWNrXSwgbGF5b3V0XzEuRXZlbnRUeXBlW2xheW91dF8xLkV2ZW50VHlwZS5lbmRdKTtcclxuICAgICAgICB2YXIgZDNsYXlvdXQgPSBfdGhpcztcclxuICAgICAgICB2YXIgZHJhZztcclxuICAgICAgICBfdGhpcy5kcmFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIWRyYWcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9yaWdpbihsYXlvdXRfMS5MYXlvdXQuZHJhZ09yaWdpbilcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJkcmFnc3RhcnQuZDNhZGFwdG9yXCIsIGxheW91dF8xLkxheW91dC5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiZHJhZy5kM2FkYXB0b3JcIiwgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXlvdXRfMS5MYXlvdXQuZHJhZyhkLCBkMy5ldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZDNsYXlvdXQucmVzdW1lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImRyYWdlbmQuZDNhZGFwdG9yXCIsIGxheW91dF8xLkxheW91dC5kcmFnRW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZHJhZztcclxuICAgICAgICAgICAgdGhpc1xyXG4gICAgICAgICAgICAgICAgLmNhbGwoZHJhZyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIGQzZXZlbnQgPSB7IHR5cGU6IGxheW91dF8xLkV2ZW50VHlwZVtlLnR5cGVdLCBhbHBoYTogZS5hbHBoYSwgc3RyZXNzOiBlLnN0cmVzcyB9O1xyXG4gICAgICAgIHRoaXMuZXZlbnRbZDNldmVudC50eXBlXShkM2V2ZW50KTtcclxuICAgIH07XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUua2ljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9zdXBlci5wcm90b3R5cGUudGljay5jYWxsKF90aGlzKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgRDNTdHlsZUxheW91dEFkYXB0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50VHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudC5vbihldmVudFR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnQub24obGF5b3V0XzEuRXZlbnRUeXBlW2V2ZW50VHlwZV0sIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEQzU3R5bGVMYXlvdXRBZGFwdG9yO1xyXG59KGxheW91dF8xLkxheW91dCkpO1xyXG5leHBvcnRzLkQzU3R5bGVMYXlvdXRBZGFwdG9yID0gRDNTdHlsZUxheW91dEFkYXB0b3I7XHJcbmZ1bmN0aW9uIGQzYWRhcHRvcigpIHtcclxuICAgIHJldHVybiBuZXcgRDNTdHlsZUxheW91dEFkYXB0b3IoKTtcclxufVxyXG5leHBvcnRzLmQzYWRhcHRvciA9IGQzYWRhcHRvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZDN2M2FkYXB0b3IuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsYXlvdXRfMSA9IHJlcXVpcmUoXCIuL2xheW91dFwiKTtcclxudmFyIEQzU3R5bGVMYXlvdXRBZGFwdG9yID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhEM1N0eWxlTGF5b3V0QWRhcHRvciwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIEQzU3R5bGVMYXlvdXRBZGFwdG9yKGQzQ29udGV4dCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuZDNDb250ZXh0ID0gZDNDb250ZXh0O1xyXG4gICAgICAgIF90aGlzLmV2ZW50ID0gZDNDb250ZXh0LmRpc3BhdGNoKGxheW91dF8xLkV2ZW50VHlwZVtsYXlvdXRfMS5FdmVudFR5cGUuc3RhcnRdLCBsYXlvdXRfMS5FdmVudFR5cGVbbGF5b3V0XzEuRXZlbnRUeXBlLnRpY2tdLCBsYXlvdXRfMS5FdmVudFR5cGVbbGF5b3V0XzEuRXZlbnRUeXBlLmVuZF0pO1xyXG4gICAgICAgIHZhciBkM2xheW91dCA9IF90aGlzO1xyXG4gICAgICAgIHZhciBkcmFnO1xyXG4gICAgICAgIF90aGlzLmRyYWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghZHJhZykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRyYWcgPSBkM0NvbnRleHQuZHJhZygpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN1YmplY3QobGF5b3V0XzEuTGF5b3V0LmRyYWdPcmlnaW4pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwic3RhcnQuZDNhZGFwdG9yXCIsIGxheW91dF8xLkxheW91dC5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiZHJhZy5kM2FkYXB0b3JcIiwgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXlvdXRfMS5MYXlvdXQuZHJhZyhkLCBkM0NvbnRleHQuZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGQzbGF5b3V0LnJlc3VtZSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJlbmQuZDNhZGFwdG9yXCIsIGxheW91dF8xLkxheW91dC5kcmFnRW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZHJhZztcclxuICAgICAgICAgICAgYXJndW1lbnRzWzBdLmNhbGwoZHJhZyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIGQzZXZlbnQgPSB7IHR5cGU6IGxheW91dF8xLkV2ZW50VHlwZVtlLnR5cGVdLCBhbHBoYTogZS5hbHBoYSwgc3RyZXNzOiBlLnN0cmVzcyB9O1xyXG4gICAgICAgIHRoaXMuZXZlbnQuY2FsbChkM2V2ZW50LnR5cGUsIGQzZXZlbnQpO1xyXG4gICAgfTtcclxuICAgIEQzU3R5bGVMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS5raWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLmQzQ29udGV4dC50aW1lcihmdW5jdGlvbiAoKSB7IHJldHVybiBfc3VwZXIucHJvdG90eXBlLnRpY2suY2FsbChfdGhpcykgJiYgdC5zdG9wKCk7IH0pO1xyXG4gICAgfTtcclxuICAgIEQzU3R5bGVMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudFR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBldmVudFR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnQub24oZXZlbnRUeXBlLCBsaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50Lm9uKGxheW91dF8xLkV2ZW50VHlwZVtldmVudFR5cGVdLCBsaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBEM1N0eWxlTGF5b3V0QWRhcHRvcjtcclxufShsYXlvdXRfMS5MYXlvdXQpKTtcclxuZXhwb3J0cy5EM1N0eWxlTGF5b3V0QWRhcHRvciA9IEQzU3R5bGVMYXlvdXRBZGFwdG9yO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kM3Y0YWRhcHRvci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgTG9ja3MgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTG9ja3MoKSB7XHJcbiAgICAgICAgdGhpcy5sb2NrcyA9IHt9O1xyXG4gICAgfVxyXG4gICAgTG9ja3MucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChpZCwgeCkge1xyXG4gICAgICAgIHRoaXMubG9ja3NbaWRdID0geDtcclxuICAgIH07XHJcbiAgICBMb2Nrcy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5sb2NrcyA9IHt9O1xyXG4gICAgfTtcclxuICAgIExvY2tzLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZvciAodmFyIGwgaW4gdGhpcy5sb2NrcylcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIExvY2tzLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgZm9yICh2YXIgbCBpbiB0aGlzLmxvY2tzKSB7XHJcbiAgICAgICAgICAgIGYoTnVtYmVyKGwpLCB0aGlzLmxvY2tzW2xdKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIExvY2tzO1xyXG59KCkpO1xyXG5leHBvcnRzLkxvY2tzID0gTG9ja3M7XHJcbnZhciBEZXNjZW50ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERlc2NlbnQoeCwgRCwgRykge1xyXG4gICAgICAgIGlmIChHID09PSB2b2lkIDApIHsgRyA9IG51bGw7IH1cclxuICAgICAgICB0aGlzLkQgPSBEO1xyXG4gICAgICAgIHRoaXMuRyA9IEc7XHJcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSAwLjAwMDE7XHJcbiAgICAgICAgdGhpcy5udW1HcmlkU25hcE5vZGVzID0gMDtcclxuICAgICAgICB0aGlzLnNuYXBHcmlkU2l6ZSA9IDEwMDtcclxuICAgICAgICB0aGlzLnNuYXBTdHJlbmd0aCA9IDEwMDA7XHJcbiAgICAgICAgdGhpcy5zY2FsZVNuYXBCeU1heEggPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJhbmRvbSA9IG5ldyBQc2V1ZG9SYW5kb20oKTtcclxuICAgICAgICB0aGlzLnByb2plY3QgPSBudWxsO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy5rID0geC5sZW5ndGg7XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLm4gPSB4WzBdLmxlbmd0aDtcclxuICAgICAgICB0aGlzLkggPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmcgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLkhkID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5hID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5iID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5jID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5kID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5lID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5pYSA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMuaWIgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLnh0bXAgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmxvY2tzID0gbmV3IExvY2tzKCk7XHJcbiAgICAgICAgdGhpcy5taW5EID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICB2YXIgaSA9IG4sIGo7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICBqID0gbjtcclxuICAgICAgICAgICAgd2hpbGUgKC0taiA+IGkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkID0gRFtpXVtqXTtcclxuICAgICAgICAgICAgICAgIGlmIChkID4gMCAmJiBkIDwgdGhpcy5taW5EKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5EID0gZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5taW5EID09PSBOdW1iZXIuTUFYX1ZBTFVFKVxyXG4gICAgICAgICAgICB0aGlzLm1pbkQgPSAxO1xyXG4gICAgICAgIGkgPSB0aGlzLms7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICB0aGlzLmdbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIHRoaXMuSFtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgaiA9IG47XHJcbiAgICAgICAgICAgIHdoaWxlIChqLS0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuSFtpXVtqXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLkhkW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmFbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIHRoaXMuYltpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5jW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmRbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIHRoaXMuZVtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5pYVtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5pYltpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy54dG1wW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIERlc2NlbnQuY3JlYXRlU3F1YXJlTWF0cml4ID0gZnVuY3Rpb24gKG4sIGYpIHtcclxuICAgICAgICB2YXIgTSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICBNW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG47ICsraikge1xyXG4gICAgICAgICAgICAgICAgTVtpXVtqXSA9IGYoaSwgaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIE07XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUub2Zmc2V0RGlyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHUgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB2YXIgbCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLms7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgeCA9IHVbaV0gPSB0aGlzLnJhbmRvbS5nZXROZXh0QmV0d2VlbigwLjAxLCAxKSAtIDAuNTtcclxuICAgICAgICAgICAgbCArPSB4ICogeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbCA9IE1hdGguc3FydChsKTtcclxuICAgICAgICByZXR1cm4gdS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHggKj0gX3RoaXMubWluRCAvIGw7IH0pO1xyXG4gICAgfTtcclxuICAgIERlc2NlbnQucHJvdG90eXBlLmNvbXB1dGVEZXJpdmF0aXZlcyA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgbiA9IHRoaXMubjtcclxuICAgICAgICBpZiAobiA8IDEpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgaTtcclxuICAgICAgICB2YXIgZCA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHZhciBkMiA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHZhciBIdXUgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB2YXIgbWF4SCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgdSA9IDA7IHUgPCBuOyArK3UpIHtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuazsgKytpKVxyXG4gICAgICAgICAgICAgICAgSHV1W2ldID0gdGhpcy5nW2ldW3VdID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCBuOyArK3YpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1ID09PSB2KVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1heERpc3BsYWNlcyA9IG47XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobWF4RGlzcGxhY2VzLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2QyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGR4ID0gZFtpXSA9IHhbaV1bdV0gLSB4W2ldW3ZdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZDIgKz0gZDJbaV0gPSBkeCAqIGR4O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2QyID4gMWUtOSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJkID0gdGhpcy5vZmZzZXREaXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhbaV1bdl0gKz0gcmRbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgbCA9IE1hdGguc3FydChzZDIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIEQgPSB0aGlzLkRbdV1bdl07XHJcbiAgICAgICAgICAgICAgICB2YXIgd2VpZ2h0ID0gdGhpcy5HICE9IG51bGwgPyB0aGlzLkdbdV1bdl0gOiAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdlaWdodCA+IDEgJiYgbCA+IEQgfHwgIWlzRmluaXRlKEQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuazsgKytpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkhbaV1bdV1bdl0gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHdlaWdodCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3ZWlnaHQgPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIEQyID0gRCAqIEQ7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ3MgPSAyICogd2VpZ2h0ICogKGwgLSBEKSAvIChEMiAqIGwpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGwzID0gbCAqIGwgKiBsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGhzID0gMiAqIC13ZWlnaHQgLyAoRDIgKiBsMyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzRmluaXRlKGdzKSlcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhncyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdbaV1bdV0gKz0gZFtpXSAqIGdzO1xyXG4gICAgICAgICAgICAgICAgICAgIEh1dVtpXSAtPSB0aGlzLkhbaV1bdV1bdl0gPSBocyAqIChsMyArIEQgKiAoZDJbaV0gLSBzZDIpICsgbCAqIHNkMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuazsgKytpKVxyXG4gICAgICAgICAgICAgICAgbWF4SCA9IE1hdGgubWF4KG1heEgsIHRoaXMuSFtpXVt1XVt1XSA9IEh1dVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByID0gdGhpcy5zbmFwR3JpZFNpemUgLyAyO1xyXG4gICAgICAgIHZhciBnID0gdGhpcy5zbmFwR3JpZFNpemU7XHJcbiAgICAgICAgdmFyIHcgPSB0aGlzLnNuYXBTdHJlbmd0aDtcclxuICAgICAgICB2YXIgayA9IHcgLyAociAqIHIpO1xyXG4gICAgICAgIHZhciBudW1Ob2RlcyA9IHRoaXMubnVtR3JpZFNuYXBOb2RlcztcclxuICAgICAgICBmb3IgKHZhciB1ID0gMDsgdSA8IG51bU5vZGVzOyArK3UpIHtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeGl1ID0gdGhpcy54W2ldW3VdO1xyXG4gICAgICAgICAgICAgICAgdmFyIG0gPSB4aXUgLyBnO1xyXG4gICAgICAgICAgICAgICAgdmFyIGYgPSBtICUgMTtcclxuICAgICAgICAgICAgICAgIHZhciBxID0gbSAtIGY7XHJcbiAgICAgICAgICAgICAgICB2YXIgYSA9IE1hdGguYWJzKGYpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gKGEgPD0gMC41KSA/IHhpdSAtIHEgKiBnIDpcclxuICAgICAgICAgICAgICAgICAgICAoeGl1ID4gMCkgPyB4aXUgLSAocSArIDEpICogZyA6IHhpdSAtIChxIC0gMSkgKiBnO1xyXG4gICAgICAgICAgICAgICAgaWYgKC1yIDwgZHggJiYgZHggPD0gcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjYWxlU25hcEJ5TWF4SCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdbaV1bdV0gKz0gbWF4SCAqIGsgKiBkeDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5IW2ldW3VdW3VdICs9IG1heEggKiBrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nW2ldW3VdICs9IGsgKiBkeDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5IW2ldW3VdW3VdICs9IGs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5sb2Nrcy5pc0VtcHR5KCkpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2Nrcy5hcHBseShmdW5jdGlvbiAodSwgcCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IF90aGlzLms7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLkhbaV1bdV1bdV0gKz0gbWF4SDtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5nW2ldW3VdIC09IG1heEggKiAocFtpXSAtIHhbaV1bdV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5kb3RQcm9kID0gZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICB2YXIgeCA9IDAsIGkgPSBhLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKVxyXG4gICAgICAgICAgICB4ICs9IGFbaV0gKiBiW2ldO1xyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuICAgIERlc2NlbnQucmlnaHRNdWx0aXBseSA9IGZ1bmN0aW9uIChtLCB2LCByKSB7XHJcbiAgICAgICAgdmFyIGkgPSBtLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKVxyXG4gICAgICAgICAgICByW2ldID0gRGVzY2VudC5kb3RQcm9kKG1baV0sIHYpO1xyXG4gICAgfTtcclxuICAgIERlc2NlbnQucHJvdG90eXBlLmNvbXB1dGVTdGVwU2l6ZSA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgdmFyIG51bWVyYXRvciA9IDAsIGRlbm9taW5hdG9yID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgIG51bWVyYXRvciArPSBEZXNjZW50LmRvdFByb2QodGhpcy5nW2ldLCBkW2ldKTtcclxuICAgICAgICAgICAgRGVzY2VudC5yaWdodE11bHRpcGx5KHRoaXMuSFtpXSwgZFtpXSwgdGhpcy5IZFtpXSk7XHJcbiAgICAgICAgICAgIGRlbm9taW5hdG9yICs9IERlc2NlbnQuZG90UHJvZChkW2ldLCB0aGlzLkhkW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRlbm9taW5hdG9yID09PSAwIHx8ICFpc0Zpbml0ZShkZW5vbWluYXRvcikpXHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIHJldHVybiAxICogbnVtZXJhdG9yIC8gZGVub21pbmF0b3I7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUucmVkdWNlU3RyZXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZURlcml2YXRpdmVzKHRoaXMueCk7XHJcbiAgICAgICAgdmFyIGFscGhhID0gdGhpcy5jb21wdXRlU3RlcFNpemUodGhpcy5nKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFrZURlc2NlbnRTdGVwKHRoaXMueFtpXSwgdGhpcy5nW2ldLCBhbHBoYSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXB1dGVTdHJlc3MoKTtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LmNvcHkgPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciBtID0gYS5sZW5ndGgsIG4gPSBiWzBdLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07ICsraSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG47ICsraikge1xyXG4gICAgICAgICAgICAgICAgYltpXVtqXSA9IGFbaV1bal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUuc3RlcEFuZFByb2plY3QgPSBmdW5jdGlvbiAoeDAsIHIsIGQsIHN0ZXBTaXplKSB7XHJcbiAgICAgICAgRGVzY2VudC5jb3B5KHgwLCByKTtcclxuICAgICAgICB0aGlzLnRha2VEZXNjZW50U3RlcChyWzBdLCBkWzBdLCBzdGVwU2l6ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMucHJvamVjdClcclxuICAgICAgICAgICAgdGhpcy5wcm9qZWN0WzBdKHgwWzBdLCB4MFsxXSwgclswXSk7XHJcbiAgICAgICAgdGhpcy50YWtlRGVzY2VudFN0ZXAoclsxXSwgZFsxXSwgc3RlcFNpemUpO1xyXG4gICAgICAgIGlmICh0aGlzLnByb2plY3QpXHJcbiAgICAgICAgICAgIHRoaXMucHJvamVjdFsxXShyWzBdLCB4MFsxXSwgclsxXSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCB0aGlzLms7IGkrKylcclxuICAgICAgICAgICAgdGhpcy50YWtlRGVzY2VudFN0ZXAocltpXSwgZFtpXSwgc3RlcFNpemUpO1xyXG4gICAgfTtcclxuICAgIERlc2NlbnQubUFwcGx5ID0gZnVuY3Rpb24gKG0sIG4sIGYpIHtcclxuICAgICAgICB2YXIgaSA9IG07XHJcbiAgICAgICAgd2hpbGUgKGktLSA+IDApIHtcclxuICAgICAgICAgICAgdmFyIGogPSBuO1xyXG4gICAgICAgICAgICB3aGlsZSAoai0tID4gMClcclxuICAgICAgICAgICAgICAgIGYoaSwgaik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERlc2NlbnQucHJvdG90eXBlLm1hdHJpeEFwcGx5ID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICBEZXNjZW50Lm1BcHBseSh0aGlzLmssIHRoaXMubiwgZik7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUuY29tcHV0ZU5leHRQb3NpdGlvbiA9IGZ1bmN0aW9uICh4MCwgcikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlRGVyaXZhdGl2ZXMoeDApO1xyXG4gICAgICAgIHZhciBhbHBoYSA9IHRoaXMuY29tcHV0ZVN0ZXBTaXplKHRoaXMuZyk7XHJcbiAgICAgICAgdGhpcy5zdGVwQW5kUHJvamVjdCh4MCwgciwgdGhpcy5nLCBhbHBoYSk7XHJcbiAgICAgICAgaWYgKHRoaXMucHJvamVjdCkge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeEFwcGx5KGZ1bmN0aW9uIChpLCBqKSB7IHJldHVybiBfdGhpcy5lW2ldW2pdID0geDBbaV1bal0gLSByW2ldW2pdOyB9KTtcclxuICAgICAgICAgICAgdmFyIGJldGEgPSB0aGlzLmNvbXB1dGVTdGVwU2l6ZSh0aGlzLmUpO1xyXG4gICAgICAgICAgICBiZXRhID0gTWF0aC5tYXgoMC4yLCBNYXRoLm1pbihiZXRhLCAxKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RlcEFuZFByb2plY3QoeDAsIHIsIHRoaXMuZSwgYmV0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERlc2NlbnQucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uIChpdGVyYXRpb25zKSB7XHJcbiAgICAgICAgdmFyIHN0cmVzcyA9IE51bWJlci5NQVhfVkFMVUUsIGNvbnZlcmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIHdoaWxlICghY29udmVyZ2VkICYmIGl0ZXJhdGlvbnMtLSA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHMgPSB0aGlzLnJ1bmdlS3V0dGEoKTtcclxuICAgICAgICAgICAgY29udmVyZ2VkID0gTWF0aC5hYnMoc3RyZXNzIC8gcyAtIDEpIDwgdGhpcy50aHJlc2hvbGQ7XHJcbiAgICAgICAgICAgIHN0cmVzcyA9IHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHJlc3M7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUucnVuZ2VLdXR0YSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZU5leHRQb3NpdGlvbih0aGlzLngsIHRoaXMuYSk7XHJcbiAgICAgICAgRGVzY2VudC5taWQodGhpcy54LCB0aGlzLmEsIHRoaXMuaWEpO1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZU5leHRQb3NpdGlvbih0aGlzLmlhLCB0aGlzLmIpO1xyXG4gICAgICAgIERlc2NlbnQubWlkKHRoaXMueCwgdGhpcy5iLCB0aGlzLmliKTtcclxuICAgICAgICB0aGlzLmNvbXB1dGVOZXh0UG9zaXRpb24odGhpcy5pYiwgdGhpcy5jKTtcclxuICAgICAgICB0aGlzLmNvbXB1dGVOZXh0UG9zaXRpb24odGhpcy5jLCB0aGlzLmQpO1xyXG4gICAgICAgIHZhciBkaXNwID0gMDtcclxuICAgICAgICB0aGlzLm1hdHJpeEFwcGx5KGZ1bmN0aW9uIChpLCBqKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gKF90aGlzLmFbaV1bal0gKyAyLjAgKiBfdGhpcy5iW2ldW2pdICsgMi4wICogX3RoaXMuY1tpXVtqXSArIF90aGlzLmRbaV1bal0pIC8gNi4wLCBkID0gX3RoaXMueFtpXVtqXSAtIHg7XHJcbiAgICAgICAgICAgIGRpc3AgKz0gZCAqIGQ7XHJcbiAgICAgICAgICAgIF90aGlzLnhbaV1bal0gPSB4O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkaXNwO1xyXG4gICAgfTtcclxuICAgIERlc2NlbnQubWlkID0gZnVuY3Rpb24gKGEsIGIsIG0pIHtcclxuICAgICAgICBEZXNjZW50Lm1BcHBseShhLmxlbmd0aCwgYVswXS5sZW5ndGgsIGZ1bmN0aW9uIChpLCBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtW2ldW2pdID0gYVtpXVtqXSArIChiW2ldW2pdIC0gYVtpXVtqXSkgLyAyLjA7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUudGFrZURlc2NlbnRTdGVwID0gZnVuY3Rpb24gKHgsIGQsIHN0ZXBTaXplKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm47ICsraSkge1xyXG4gICAgICAgICAgICB4W2ldID0geFtpXSAtIHN0ZXBTaXplICogZFtpXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUuY29tcHV0ZVN0cmVzcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc3RyZXNzID0gMDtcclxuICAgICAgICBmb3IgKHZhciB1ID0gMCwgbk1pbnVzMSA9IHRoaXMubiAtIDE7IHUgPCBuTWludXMxOyArK3UpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgdiA9IHUgKyAxLCBuID0gdGhpcy5uOyB2IDwgbjsgKyt2KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGR4ID0gdGhpcy54W2ldW3VdIC0gdGhpcy54W2ldW3ZdO1xyXG4gICAgICAgICAgICAgICAgICAgIGwgKz0gZHggKiBkeDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGwgPSBNYXRoLnNxcnQobCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZCA9IHRoaXMuRFt1XVt2XTtcclxuICAgICAgICAgICAgICAgIGlmICghaXNGaW5pdGUoZCkpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmwgPSBkIC0gbDtcclxuICAgICAgICAgICAgICAgIHZhciBkMiA9IGQgKiBkO1xyXG4gICAgICAgICAgICAgICAgc3RyZXNzICs9IHJsICogcmwgLyBkMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyZXNzO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBEZXNjZW50O1xyXG59KCkpO1xyXG5EZXNjZW50Lnplcm9EaXN0YW5jZSA9IDFlLTEwO1xyXG5leHBvcnRzLkRlc2NlbnQgPSBEZXNjZW50O1xyXG52YXIgUHNldWRvUmFuZG9tID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBzZXVkb1JhbmRvbShzZWVkKSB7XHJcbiAgICAgICAgaWYgKHNlZWQgPT09IHZvaWQgMCkgeyBzZWVkID0gMTsgfVxyXG4gICAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XHJcbiAgICAgICAgdGhpcy5hID0gMjE0MDEzO1xyXG4gICAgICAgIHRoaXMuYyA9IDI1MzEwMTE7XHJcbiAgICAgICAgdGhpcy5tID0gMjE0NzQ4MzY0ODtcclxuICAgICAgICB0aGlzLnJhbmdlID0gMzI3Njc7XHJcbiAgICB9XHJcbiAgICBQc2V1ZG9SYW5kb20ucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZWVkID0gKHRoaXMuc2VlZCAqIHRoaXMuYSArIHRoaXMuYykgJSB0aGlzLm07XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnNlZWQgPj4gMTYpIC8gdGhpcy5yYW5nZTtcclxuICAgIH07XHJcbiAgICBQc2V1ZG9SYW5kb20ucHJvdG90eXBlLmdldE5leHRCZXR3ZWVuID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgcmV0dXJuIG1pbiArIHRoaXMuZ2V0TmV4dCgpICogKG1heCAtIG1pbik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBzZXVkb1JhbmRvbTtcclxufSgpKTtcclxuZXhwb3J0cy5Qc2V1ZG9SYW5kb20gPSBQc2V1ZG9SYW5kb207XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlc2NlbnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciByZWN0YW5nbGVfMSA9IHJlcXVpcmUoXCIuL3JlY3RhbmdsZVwiKTtcclxudmFyIFBvaW50ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBvaW50KCkge1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBvaW50O1xyXG59KCkpO1xyXG5leHBvcnRzLlBvaW50ID0gUG9pbnQ7XHJcbnZhciBMaW5lU2VnbWVudCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMaW5lU2VnbWVudCh4MSwgeTEsIHgyLCB5Mikge1xyXG4gICAgICAgIHRoaXMueDEgPSB4MTtcclxuICAgICAgICB0aGlzLnkxID0geTE7XHJcbiAgICAgICAgdGhpcy54MiA9IHgyO1xyXG4gICAgICAgIHRoaXMueTIgPSB5MjtcclxuICAgIH1cclxuICAgIHJldHVybiBMaW5lU2VnbWVudDtcclxufSgpKTtcclxuZXhwb3J0cy5MaW5lU2VnbWVudCA9IExpbmVTZWdtZW50O1xyXG52YXIgUG9seVBvaW50ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhQb2x5UG9pbnQsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBQb2x5UG9pbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFBvbHlQb2ludDtcclxufShQb2ludCkpO1xyXG5leHBvcnRzLlBvbHlQb2ludCA9IFBvbHlQb2ludDtcclxuZnVuY3Rpb24gaXNMZWZ0KFAwLCBQMSwgUDIpIHtcclxuICAgIHJldHVybiAoUDEueCAtIFAwLngpICogKFAyLnkgLSBQMC55KSAtIChQMi54IC0gUDAueCkgKiAoUDEueSAtIFAwLnkpO1xyXG59XHJcbmV4cG9ydHMuaXNMZWZ0ID0gaXNMZWZ0O1xyXG5mdW5jdGlvbiBhYm92ZShwLCB2aSwgdmopIHtcclxuICAgIHJldHVybiBpc0xlZnQocCwgdmksIHZqKSA+IDA7XHJcbn1cclxuZnVuY3Rpb24gYmVsb3cocCwgdmksIHZqKSB7XHJcbiAgICByZXR1cm4gaXNMZWZ0KHAsIHZpLCB2aikgPCAwO1xyXG59XHJcbmZ1bmN0aW9uIENvbnZleEh1bGwoUykge1xyXG4gICAgdmFyIFAgPSBTLnNsaWNlKDApLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEueCAhPT0gYi54ID8gYi54IC0gYS54IDogYi55IC0gYS55OyB9KTtcclxuICAgIHZhciBuID0gUy5sZW5ndGgsIGk7XHJcbiAgICB2YXIgbWlubWluID0gMDtcclxuICAgIHZhciB4bWluID0gUFswXS54O1xyXG4gICAgZm9yIChpID0gMTsgaSA8IG47ICsraSkge1xyXG4gICAgICAgIGlmIChQW2ldLnggIT09IHhtaW4pXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdmFyIG1pbm1heCA9IGkgLSAxO1xyXG4gICAgdmFyIEggPSBbXTtcclxuICAgIEgucHVzaChQW21pbm1pbl0pO1xyXG4gICAgaWYgKG1pbm1heCA9PT0gbiAtIDEpIHtcclxuICAgICAgICBpZiAoUFttaW5tYXhdLnkgIT09IFBbbWlubWluXS55KVxyXG4gICAgICAgICAgICBILnB1c2goUFttaW5tYXhdKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHZhciBtYXhtaW4sIG1heG1heCA9IG4gLSAxO1xyXG4gICAgICAgIHZhciB4bWF4ID0gUFtuIC0gMV0ueDtcclxuICAgICAgICBmb3IgKGkgPSBuIC0gMjsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgIGlmIChQW2ldLnggIT09IHhtYXgpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICBtYXhtaW4gPSBpICsgMTtcclxuICAgICAgICBpID0gbWlubWF4O1xyXG4gICAgICAgIHdoaWxlICgrK2kgPD0gbWF4bWluKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0xlZnQoUFttaW5taW5dLCBQW21heG1pbl0sIFBbaV0pID49IDAgJiYgaSA8IG1heG1pbilcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB3aGlsZSAoSC5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNMZWZ0KEhbSC5sZW5ndGggLSAyXSwgSFtILmxlbmd0aCAtIDFdLCBQW2ldKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgSC5sZW5ndGggLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPSBtaW5taW4pXHJcbiAgICAgICAgICAgICAgICBILnB1c2goUFtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtYXhtYXggIT0gbWF4bWluKVxyXG4gICAgICAgICAgICBILnB1c2goUFttYXhtYXhdKTtcclxuICAgICAgICB2YXIgYm90ID0gSC5sZW5ndGg7XHJcbiAgICAgICAgaSA9IG1heG1pbjtcclxuICAgICAgICB3aGlsZSAoLS1pID49IG1pbm1heCkge1xyXG4gICAgICAgICAgICBpZiAoaXNMZWZ0KFBbbWF4bWF4XSwgUFttaW5tYXhdLCBQW2ldKSA+PSAwICYmIGkgPiBtaW5tYXgpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgd2hpbGUgKEgubGVuZ3RoID4gYm90KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNMZWZ0KEhbSC5sZW5ndGggLSAyXSwgSFtILmxlbmd0aCAtIDFdLCBQW2ldKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgSC5sZW5ndGggLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPSBtaW5taW4pXHJcbiAgICAgICAgICAgICAgICBILnB1c2goUFtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIEg7XHJcbn1cclxuZXhwb3J0cy5Db252ZXhIdWxsID0gQ29udmV4SHVsbDtcclxuZnVuY3Rpb24gY2xvY2t3aXNlUmFkaWFsU3dlZXAocCwgUCwgZikge1xyXG4gICAgUC5zbGljZSgwKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBNYXRoLmF0YW4yKGEueSAtIHAueSwgYS54IC0gcC54KSAtIE1hdGguYXRhbjIoYi55IC0gcC55LCBiLnggLSBwLngpOyB9KS5mb3JFYWNoKGYpO1xyXG59XHJcbmV4cG9ydHMuY2xvY2t3aXNlUmFkaWFsU3dlZXAgPSBjbG9ja3dpc2VSYWRpYWxTd2VlcDtcclxuZnVuY3Rpb24gbmV4dFBvbHlQb2ludChwLCBwcykge1xyXG4gICAgaWYgKHAucG9seUluZGV4ID09PSBwcy5sZW5ndGggLSAxKVxyXG4gICAgICAgIHJldHVybiBwc1swXTtcclxuICAgIHJldHVybiBwc1twLnBvbHlJbmRleCArIDFdO1xyXG59XHJcbmZ1bmN0aW9uIHByZXZQb2x5UG9pbnQocCwgcHMpIHtcclxuICAgIGlmIChwLnBvbHlJbmRleCA9PT0gMClcclxuICAgICAgICByZXR1cm4gcHNbcHMubGVuZ3RoIC0gMV07XHJcbiAgICByZXR1cm4gcHNbcC5wb2x5SW5kZXggLSAxXTtcclxufVxyXG5mdW5jdGlvbiB0YW5nZW50X1BvaW50UG9seUMoUCwgVikge1xyXG4gICAgcmV0dXJuIHsgcnRhbjogUnRhbmdlbnRfUG9pbnRQb2x5QyhQLCBWKSwgbHRhbjogTHRhbmdlbnRfUG9pbnRQb2x5QyhQLCBWKSB9O1xyXG59XHJcbmZ1bmN0aW9uIFJ0YW5nZW50X1BvaW50UG9seUMoUCwgVikge1xyXG4gICAgdmFyIG4gPSBWLmxlbmd0aCAtIDE7XHJcbiAgICB2YXIgYSwgYiwgYztcclxuICAgIHZhciB1cEEsIGRuQztcclxuICAgIGlmIChiZWxvdyhQLCBWWzFdLCBWWzBdKSAmJiAhYWJvdmUoUCwgVltuIC0gMV0sIFZbMF0pKVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgZm9yIChhID0gMCwgYiA9IG47Oykge1xyXG4gICAgICAgIGlmIChiIC0gYSA9PT0gMSlcclxuICAgICAgICAgICAgaWYgKGFib3ZlKFAsIFZbYV0sIFZbYl0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGE7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBiO1xyXG4gICAgICAgIGMgPSBNYXRoLmZsb29yKChhICsgYikgLyAyKTtcclxuICAgICAgICBkbkMgPSBiZWxvdyhQLCBWW2MgKyAxXSwgVltjXSk7XHJcbiAgICAgICAgaWYgKGRuQyAmJiAhYWJvdmUoUCwgVltjIC0gMV0sIFZbY10pKVxyXG4gICAgICAgICAgICByZXR1cm4gYztcclxuICAgICAgICB1cEEgPSBhYm92ZShQLCBWW2EgKyAxXSwgVlthXSk7XHJcbiAgICAgICAgaWYgKHVwQSkge1xyXG4gICAgICAgICAgICBpZiAoZG5DKVxyXG4gICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFib3ZlKFAsIFZbYV0sIFZbY10pKVxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBjO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGEgPSBjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIWRuQylcclxuICAgICAgICAgICAgICAgIGEgPSBjO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChiZWxvdyhQLCBWW2FdLCBWW2NdKSlcclxuICAgICAgICAgICAgICAgICAgICBiID0gYztcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBhID0gYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBMdGFuZ2VudF9Qb2ludFBvbHlDKFAsIFYpIHtcclxuICAgIHZhciBuID0gVi5sZW5ndGggLSAxO1xyXG4gICAgdmFyIGEsIGIsIGM7XHJcbiAgICB2YXIgZG5BLCBkbkM7XHJcbiAgICBpZiAoYWJvdmUoUCwgVltuIC0gMV0sIFZbMF0pICYmICFiZWxvdyhQLCBWWzFdLCBWWzBdKSlcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIGZvciAoYSA9IDAsIGIgPSBuOzspIHtcclxuICAgICAgICBpZiAoYiAtIGEgPT09IDEpXHJcbiAgICAgICAgICAgIGlmIChiZWxvdyhQLCBWW2FdLCBWW2JdKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBhO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYjtcclxuICAgICAgICBjID0gTWF0aC5mbG9vcigoYSArIGIpIC8gMik7XHJcbiAgICAgICAgZG5DID0gYmVsb3coUCwgVltjICsgMV0sIFZbY10pO1xyXG4gICAgICAgIGlmIChhYm92ZShQLCBWW2MgLSAxXSwgVltjXSkgJiYgIWRuQylcclxuICAgICAgICAgICAgcmV0dXJuIGM7XHJcbiAgICAgICAgZG5BID0gYmVsb3coUCwgVlthICsgMV0sIFZbYV0pO1xyXG4gICAgICAgIGlmIChkbkEpIHtcclxuICAgICAgICAgICAgaWYgKCFkbkMpXHJcbiAgICAgICAgICAgICAgICBiID0gYztcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYmVsb3coUCwgVlthXSwgVltjXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgYSA9IGM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChkbkMpXHJcbiAgICAgICAgICAgICAgICBhID0gYztcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWJvdmUoUCwgVlthXSwgVltjXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgYSA9IGM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gdGFuZ2VudF9Qb2x5UG9seUMoViwgVywgdDEsIHQyLCBjbXAxLCBjbXAyKSB7XHJcbiAgICB2YXIgaXgxLCBpeDI7XHJcbiAgICBpeDEgPSB0MShXWzBdLCBWKTtcclxuICAgIGl4MiA9IHQyKFZbaXgxXSwgVyk7XHJcbiAgICB2YXIgZG9uZSA9IGZhbHNlO1xyXG4gICAgd2hpbGUgKCFkb25lKSB7XHJcbiAgICAgICAgZG9uZSA9IHRydWU7XHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKGl4MSA9PT0gVi5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgICAgICAgaXgxID0gMDtcclxuICAgICAgICAgICAgaWYgKGNtcDEoV1tpeDJdLCBWW2l4MV0sIFZbaXgxICsgMV0pKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICsraXgxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoaXgyID09PSAwKVxyXG4gICAgICAgICAgICAgICAgaXgyID0gVy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBpZiAoY21wMihWW2l4MV0sIFdbaXgyXSwgV1tpeDIgLSAxXSkpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgLS1peDI7XHJcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyB0MTogaXgxLCB0MjogaXgyIH07XHJcbn1cclxuZXhwb3J0cy50YW5nZW50X1BvbHlQb2x5QyA9IHRhbmdlbnRfUG9seVBvbHlDO1xyXG5mdW5jdGlvbiBMUnRhbmdlbnRfUG9seVBvbHlDKFYsIFcpIHtcclxuICAgIHZhciBybCA9IFJMdGFuZ2VudF9Qb2x5UG9seUMoVywgVik7XHJcbiAgICByZXR1cm4geyB0MTogcmwudDIsIHQyOiBybC50MSB9O1xyXG59XHJcbmV4cG9ydHMuTFJ0YW5nZW50X1BvbHlQb2x5QyA9IExSdGFuZ2VudF9Qb2x5UG9seUM7XHJcbmZ1bmN0aW9uIFJMdGFuZ2VudF9Qb2x5UG9seUMoViwgVykge1xyXG4gICAgcmV0dXJuIHRhbmdlbnRfUG9seVBvbHlDKFYsIFcsIFJ0YW5nZW50X1BvaW50UG9seUMsIEx0YW5nZW50X1BvaW50UG9seUMsIGFib3ZlLCBiZWxvdyk7XHJcbn1cclxuZXhwb3J0cy5STHRhbmdlbnRfUG9seVBvbHlDID0gUkx0YW5nZW50X1BvbHlQb2x5QztcclxuZnVuY3Rpb24gTEx0YW5nZW50X1BvbHlQb2x5QyhWLCBXKSB7XHJcbiAgICByZXR1cm4gdGFuZ2VudF9Qb2x5UG9seUMoViwgVywgTHRhbmdlbnRfUG9pbnRQb2x5QywgTHRhbmdlbnRfUG9pbnRQb2x5QywgYmVsb3csIGJlbG93KTtcclxufVxyXG5leHBvcnRzLkxMdGFuZ2VudF9Qb2x5UG9seUMgPSBMTHRhbmdlbnRfUG9seVBvbHlDO1xyXG5mdW5jdGlvbiBSUnRhbmdlbnRfUG9seVBvbHlDKFYsIFcpIHtcclxuICAgIHJldHVybiB0YW5nZW50X1BvbHlQb2x5QyhWLCBXLCBSdGFuZ2VudF9Qb2ludFBvbHlDLCBSdGFuZ2VudF9Qb2ludFBvbHlDLCBhYm92ZSwgYWJvdmUpO1xyXG59XHJcbmV4cG9ydHMuUlJ0YW5nZW50X1BvbHlQb2x5QyA9IFJSdGFuZ2VudF9Qb2x5UG9seUM7XHJcbnZhciBCaVRhbmdlbnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQmlUYW5nZW50KHQxLCB0Mikge1xyXG4gICAgICAgIHRoaXMudDEgPSB0MTtcclxuICAgICAgICB0aGlzLnQyID0gdDI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQmlUYW5nZW50O1xyXG59KCkpO1xyXG5leHBvcnRzLkJpVGFuZ2VudCA9IEJpVGFuZ2VudDtcclxudmFyIEJpVGFuZ2VudHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQmlUYW5nZW50cygpIHtcclxuICAgIH1cclxuICAgIHJldHVybiBCaVRhbmdlbnRzO1xyXG59KCkpO1xyXG5leHBvcnRzLkJpVGFuZ2VudHMgPSBCaVRhbmdlbnRzO1xyXG52YXIgVFZHUG9pbnQgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFRWR1BvaW50LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gVFZHUG9pbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFRWR1BvaW50O1xyXG59KFBvaW50KSk7XHJcbmV4cG9ydHMuVFZHUG9pbnQgPSBUVkdQb2ludDtcclxudmFyIFZpc2liaWxpdHlWZXJ0ZXggPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmlzaWJpbGl0eVZlcnRleChpZCwgcG9seWlkLCBwb2x5dmVydGlkLCBwKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMucG9seWlkID0gcG9seWlkO1xyXG4gICAgICAgIHRoaXMucG9seXZlcnRpZCA9IHBvbHl2ZXJ0aWQ7XHJcbiAgICAgICAgdGhpcy5wID0gcDtcclxuICAgICAgICBwLnZ2ID0gdGhpcztcclxuICAgIH1cclxuICAgIHJldHVybiBWaXNpYmlsaXR5VmVydGV4O1xyXG59KCkpO1xyXG5leHBvcnRzLlZpc2liaWxpdHlWZXJ0ZXggPSBWaXNpYmlsaXR5VmVydGV4O1xyXG52YXIgVmlzaWJpbGl0eUVkZ2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmlzaWJpbGl0eUVkZ2Uoc291cmNlLCB0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgIH1cclxuICAgIFZpc2liaWxpdHlFZGdlLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGR4ID0gdGhpcy5zb3VyY2UucC54IC0gdGhpcy50YXJnZXQucC54O1xyXG4gICAgICAgIHZhciBkeSA9IHRoaXMuc291cmNlLnAueSAtIHRoaXMudGFyZ2V0LnAueTtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVmlzaWJpbGl0eUVkZ2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVmlzaWJpbGl0eUVkZ2UgPSBWaXNpYmlsaXR5RWRnZTtcclxudmFyIFRhbmdlbnRWaXNpYmlsaXR5R3JhcGggPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVGFuZ2VudFZpc2liaWxpdHlHcmFwaChQLCBnMCkge1xyXG4gICAgICAgIHRoaXMuUCA9IFA7XHJcbiAgICAgICAgdGhpcy5WID0gW107XHJcbiAgICAgICAgdGhpcy5FID0gW107XHJcbiAgICAgICAgaWYgKCFnMCkge1xyXG4gICAgICAgICAgICB2YXIgbiA9IFAubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBQW2ldO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBqID0gcFtqXSwgdnYgPSBuZXcgVmlzaWJpbGl0eVZlcnRleCh0aGlzLlYubGVuZ3RoLCBpLCBqLCBwaik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5WLnB1c2godnYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5FLnB1c2gobmV3IFZpc2liaWxpdHlFZGdlKHBbaiAtIDFdLnZ2LCB2dikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbiAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIFBpID0gUFtpXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IG47IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBQaiA9IFBbal0sIHQgPSB0YW5nZW50cyhQaSwgUGopO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHEgaW4gdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IHRbcV0sIHNvdXJjZSA9IFBpW2MudDFdLCB0YXJnZXQgPSBQaltjLnQyXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFZGdlSWZWaXNpYmxlKHNvdXJjZSwgdGFyZ2V0LCBpLCBqKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuViA9IGcwLlYuc2xpY2UoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuRSA9IGcwLkUuc2xpY2UoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgVGFuZ2VudFZpc2liaWxpdHlHcmFwaC5wcm90b3R5cGUuYWRkRWRnZUlmVmlzaWJsZSA9IGZ1bmN0aW9uICh1LCB2LCBpMSwgaTIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW50ZXJzZWN0c1BvbHlzKG5ldyBMaW5lU2VnbWVudCh1LngsIHUueSwgdi54LCB2LnkpLCBpMSwgaTIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuRS5wdXNoKG5ldyBWaXNpYmlsaXR5RWRnZSh1LnZ2LCB2LnZ2KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRhbmdlbnRWaXNpYmlsaXR5R3JhcGgucHJvdG90eXBlLmFkZFBvaW50ID0gZnVuY3Rpb24gKHAsIGkxKSB7XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLlAubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuVi5wdXNoKG5ldyBWaXNpYmlsaXR5VmVydGV4KHRoaXMuVi5sZW5ndGgsIG4sIDAsIHApKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gaTEpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgdmFyIHBvbHkgPSB0aGlzLlBbaV0sIHQgPSB0YW5nZW50X1BvaW50UG9seUMocCwgcG9seSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkRWRnZUlmVmlzaWJsZShwLCBwb2x5W3QubHRhbl0sIGkxLCBpKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRFZGdlSWZWaXNpYmxlKHAsIHBvbHlbdC5ydGFuXSwgaTEsIGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcC52djtcclxuICAgIH07XHJcbiAgICBUYW5nZW50VmlzaWJpbGl0eUdyYXBoLnByb3RvdHlwZS5pbnRlcnNlY3RzUG9seXMgPSBmdW5jdGlvbiAobCwgaTEsIGkyKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0aGlzLlAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChpICE9IGkxICYmIGkgIT0gaTIgJiYgaW50ZXJzZWN0cyhsLCB0aGlzLlBbaV0pLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVGFuZ2VudFZpc2liaWxpdHlHcmFwaDtcclxufSgpKTtcclxuZXhwb3J0cy5UYW5nZW50VmlzaWJpbGl0eUdyYXBoID0gVGFuZ2VudFZpc2liaWxpdHlHcmFwaDtcclxuZnVuY3Rpb24gaW50ZXJzZWN0cyhsLCBQKSB7XHJcbiAgICB2YXIgaW50cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDEsIG4gPSBQLmxlbmd0aDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgIHZhciBpbnQgPSByZWN0YW5nbGVfMS5SZWN0YW5nbGUubGluZUludGVyc2VjdGlvbihsLngxLCBsLnkxLCBsLngyLCBsLnkyLCBQW2kgLSAxXS54LCBQW2kgLSAxXS55LCBQW2ldLngsIFBbaV0ueSk7XHJcbiAgICAgICAgaWYgKGludClcclxuICAgICAgICAgICAgaW50cy5wdXNoKGludCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW50cztcclxufVxyXG5mdW5jdGlvbiB0YW5nZW50cyhWLCBXKSB7XHJcbiAgICB2YXIgbSA9IFYubGVuZ3RoIC0gMSwgbiA9IFcubGVuZ3RoIC0gMTtcclxuICAgIHZhciBidCA9IG5ldyBCaVRhbmdlbnRzKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07ICsraSkge1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgKytqKSB7XHJcbiAgICAgICAgICAgIHZhciB2MSA9IFZbaSA9PSAwID8gbSAtIDEgOiBpIC0gMV07XHJcbiAgICAgICAgICAgIHZhciB2MiA9IFZbaV07XHJcbiAgICAgICAgICAgIHZhciB2MyA9IFZbaSArIDFdO1xyXG4gICAgICAgICAgICB2YXIgdzEgPSBXW2ogPT0gMCA/IG4gLSAxIDogaiAtIDFdO1xyXG4gICAgICAgICAgICB2YXIgdzIgPSBXW2pdO1xyXG4gICAgICAgICAgICB2YXIgdzMgPSBXW2ogKyAxXTtcclxuICAgICAgICAgICAgdmFyIHYxdjJ3MiA9IGlzTGVmdCh2MSwgdjIsIHcyKTtcclxuICAgICAgICAgICAgdmFyIHYydzF3MiA9IGlzTGVmdCh2MiwgdzEsIHcyKTtcclxuICAgICAgICAgICAgdmFyIHYydzJ3MyA9IGlzTGVmdCh2MiwgdzIsIHczKTtcclxuICAgICAgICAgICAgdmFyIHcxdzJ2MiA9IGlzTGVmdCh3MSwgdzIsIHYyKTtcclxuICAgICAgICAgICAgdmFyIHcydjF2MiA9IGlzTGVmdCh3MiwgdjEsIHYyKTtcclxuICAgICAgICAgICAgdmFyIHcydjJ2MyA9IGlzTGVmdCh3MiwgdjIsIHYzKTtcclxuICAgICAgICAgICAgaWYgKHYxdjJ3MiA+PSAwICYmIHYydzF3MiA+PSAwICYmIHYydzJ3MyA8IDBcclxuICAgICAgICAgICAgICAgICYmIHcxdzJ2MiA+PSAwICYmIHcydjF2MiA+PSAwICYmIHcydjJ2MyA8IDApIHtcclxuICAgICAgICAgICAgICAgIGJ0LmxsID0gbmV3IEJpVGFuZ2VudChpLCBqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh2MXYydzIgPD0gMCAmJiB2MncxdzIgPD0gMCAmJiB2MncydzMgPiAwXHJcbiAgICAgICAgICAgICAgICAmJiB3MXcydjIgPD0gMCAmJiB3MnYxdjIgPD0gMCAmJiB3MnYydjMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBidC5yciA9IG5ldyBCaVRhbmdlbnQoaSwgaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodjF2MncyIDw9IDAgJiYgdjJ3MXcyID4gMCAmJiB2MncydzMgPD0gMFxyXG4gICAgICAgICAgICAgICAgJiYgdzF3MnYyID49IDAgJiYgdzJ2MXYyIDwgMCAmJiB3MnYydjMgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgYnQucmwgPSBuZXcgQmlUYW5nZW50KGksIGopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHYxdjJ3MiA+PSAwICYmIHYydzF3MiA8IDAgJiYgdjJ3MnczID49IDBcclxuICAgICAgICAgICAgICAgICYmIHcxdzJ2MiA8PSAwICYmIHcydjF2MiA+IDAgJiYgdzJ2MnYzIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGJ0LmxyID0gbmV3IEJpVGFuZ2VudChpLCBqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBidDtcclxufVxyXG5leHBvcnRzLnRhbmdlbnRzID0gdGFuZ2VudHM7XHJcbmZ1bmN0aW9uIGlzUG9pbnRJbnNpZGVQb2x5KHAsIHBvbHkpIHtcclxuICAgIGZvciAodmFyIGkgPSAxLCBuID0gcG9seS5sZW5ndGg7IGkgPCBuOyArK2kpXHJcbiAgICAgICAgaWYgKGJlbG93KHBvbHlbaSAtIDFdLCBwb2x5W2ldLCBwKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuZnVuY3Rpb24gaXNBbnlQSW5RKHAsIHEpIHtcclxuICAgIHJldHVybiAhcC5ldmVyeShmdW5jdGlvbiAodikgeyByZXR1cm4gIWlzUG9pbnRJbnNpZGVQb2x5KHYsIHEpOyB9KTtcclxufVxyXG5mdW5jdGlvbiBwb2x5c092ZXJsYXAocCwgcSkge1xyXG4gICAgaWYgKGlzQW55UEluUShwLCBxKSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGlmIChpc0FueVBJblEocSwgcCkpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBmb3IgKHZhciBpID0gMSwgbiA9IHAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgdmFyIHYgPSBwW2ldLCB1ID0gcFtpIC0gMV07XHJcbiAgICAgICAgaWYgKGludGVyc2VjdHMobmV3IExpbmVTZWdtZW50KHUueCwgdS55LCB2LngsIHYueSksIHEpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbmV4cG9ydHMucG9seXNPdmVybGFwID0gcG9seXNPdmVybGFwO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciByZWN0YW5nbGVfMSA9IHJlcXVpcmUoXCIuL3JlY3RhbmdsZVwiKTtcclxudmFyIHZwc2NfMSA9IHJlcXVpcmUoXCIuL3Zwc2NcIik7XHJcbnZhciBzaG9ydGVzdHBhdGhzXzEgPSByZXF1aXJlKFwiLi9zaG9ydGVzdHBhdGhzXCIpO1xyXG52YXIgTm9kZVdyYXBwZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm9kZVdyYXBwZXIoaWQsIHJlY3QsIGNoaWxkcmVuKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMucmVjdCA9IHJlY3Q7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICAgIHRoaXMubGVhZiA9IHR5cGVvZiBjaGlsZHJlbiA9PT0gJ3VuZGVmaW5lZCcgfHwgY2hpbGRyZW4ubGVuZ3RoID09PSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5vZGVXcmFwcGVyO1xyXG59KCkpO1xyXG5leHBvcnRzLk5vZGVXcmFwcGVyID0gTm9kZVdyYXBwZXI7XHJcbnZhciBWZXJ0ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZlcnQoaWQsIHgsIHksIG5vZGUsIGxpbmUpIHtcclxuICAgICAgICBpZiAobm9kZSA9PT0gdm9pZCAwKSB7IG5vZGUgPSBudWxsOyB9XHJcbiAgICAgICAgaWYgKGxpbmUgPT09IHZvaWQgMCkgeyBsaW5lID0gbnVsbDsgfVxyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcclxuICAgICAgICB0aGlzLmxpbmUgPSBsaW5lO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFZlcnQ7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVmVydCA9IFZlcnQ7XHJcbnZhciBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlKHMsIHQpIHtcclxuICAgICAgICB0aGlzLnMgPSBzO1xyXG4gICAgICAgIHRoaXMudCA9IHQ7XHJcbiAgICAgICAgdmFyIG1mID0gTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlLmZpbmRNYXRjaChzLCB0KTtcclxuICAgICAgICB2YXIgdHIgPSB0LnNsaWNlKDApLnJldmVyc2UoKTtcclxuICAgICAgICB2YXIgbXIgPSBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UuZmluZE1hdGNoKHMsIHRyKTtcclxuICAgICAgICBpZiAobWYubGVuZ3RoID49IG1yLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IG1mLmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5zaSA9IG1mLnNpO1xyXG4gICAgICAgICAgICB0aGlzLnRpID0gbWYudGk7XHJcbiAgICAgICAgICAgIHRoaXMucmV2ZXJzZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoID0gbXIubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLnNpID0gbXIuc2k7XHJcbiAgICAgICAgICAgIHRoaXMudGkgPSB0Lmxlbmd0aCAtIG1yLnRpIC0gbXIubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLnJldmVyc2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UuZmluZE1hdGNoID0gZnVuY3Rpb24gKHMsIHQpIHtcclxuICAgICAgICB2YXIgbSA9IHMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBuID0gdC5sZW5ndGg7XHJcbiAgICAgICAgdmFyIG1hdGNoID0geyBsZW5ndGg6IDAsIHNpOiAtMSwgdGk6IC0xIH07XHJcbiAgICAgICAgdmFyIGwgPSBuZXcgQXJyYXkobSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtOyBpKyspIHtcclxuICAgICAgICAgICAgbFtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuOyBqKyspXHJcbiAgICAgICAgICAgICAgICBpZiAoc1tpXSA9PT0gdFtqXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2ID0gbFtpXVtqXSA9IChpID09PSAwIHx8IGogPT09IDApID8gMSA6IGxbaSAtIDFdW2ogLSAxXSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHYgPiBtYXRjaC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2gubGVuZ3RoID0gdjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2guc2kgPSBpIC0gdiArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoLnRpID0gaiAtIHYgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgbFtpXVtqXSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXRjaDtcclxuICAgIH07XHJcbiAgICBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UucHJvdG90eXBlLmdldFNlcXVlbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxlbmd0aCA+PSAwID8gdGhpcy5zLnNsaWNlKHRoaXMuc2ksIHRoaXMuc2kgKyB0aGlzLmxlbmd0aCkgOiBbXTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlO1xyXG59KCkpO1xyXG5leHBvcnRzLkxvbmdlc3RDb21tb25TdWJzZXF1ZW5jZSA9IExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZTtcclxudmFyIEdyaWRSb3V0ZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gR3JpZFJvdXRlcihvcmlnaW5hbG5vZGVzLCBhY2Nlc3NvciwgZ3JvdXBQYWRkaW5nKSB7XHJcbiAgICAgICAgaWYgKGdyb3VwUGFkZGluZyA9PT0gdm9pZCAwKSB7IGdyb3VwUGFkZGluZyA9IDEyOyB9XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLm9yaWdpbmFsbm9kZXMgPSBvcmlnaW5hbG5vZGVzO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBQYWRkaW5nID0gZ3JvdXBQYWRkaW5nO1xyXG4gICAgICAgIHRoaXMubGVhdmVzID0gbnVsbDtcclxuICAgICAgICB0aGlzLm5vZGVzID0gb3JpZ2luYWxub2Rlcy5tYXAoZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIG5ldyBOb2RlV3JhcHBlcihpLCBhY2Nlc3Nvci5nZXRCb3VuZHModiksIGFjY2Vzc29yLmdldENoaWxkcmVuKHYpKTsgfSk7XHJcbiAgICAgICAgdGhpcy5sZWF2ZXMgPSB0aGlzLm5vZGVzLmZpbHRlcihmdW5jdGlvbiAodikgeyByZXR1cm4gdi5sZWFmOyB9KTtcclxuICAgICAgICB0aGlzLmdyb3VwcyA9IHRoaXMubm9kZXMuZmlsdGVyKGZ1bmN0aW9uIChnKSB7IHJldHVybiAhZy5sZWFmOyB9KTtcclxuICAgICAgICB0aGlzLmNvbHMgPSB0aGlzLmdldEdyaWRMaW5lcygneCcpO1xyXG4gICAgICAgIHRoaXMucm93cyA9IHRoaXMuZ2V0R3JpZExpbmVzKCd5Jyk7XHJcbiAgICAgICAgdGhpcy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICByZXR1cm4gdi5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IHJldHVybiBfdGhpcy5ub2Rlc1tjXS5wYXJlbnQgPSB2OyB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnJvb3QgPSB7IGNoaWxkcmVuOiBbXSB9O1xyXG4gICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYucGFyZW50ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgdi5wYXJlbnQgPSBfdGhpcy5yb290O1xyXG4gICAgICAgICAgICAgICAgX3RoaXMucm9vdC5jaGlsZHJlbi5wdXNoKHYuaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHYucG9ydHMgPSBbXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJhY2tUb0Zyb250ID0gdGhpcy5ub2Rlcy5zbGljZSgwKTtcclxuICAgICAgICB0aGlzLmJhY2tUb0Zyb250LnNvcnQoZnVuY3Rpb24gKHgsIHkpIHsgcmV0dXJuIF90aGlzLmdldERlcHRoKHgpIC0gX3RoaXMuZ2V0RGVwdGgoeSk7IH0pO1xyXG4gICAgICAgIHZhciBmcm9udFRvQmFja0dyb3VwcyA9IHRoaXMuYmFja1RvRnJvbnQuc2xpY2UoMCkucmV2ZXJzZSgpLmZpbHRlcihmdW5jdGlvbiAoZykgeyByZXR1cm4gIWcubGVhZjsgfSk7XHJcbiAgICAgICAgZnJvbnRUb0JhY2tHcm91cHMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICB2YXIgciA9IHJlY3RhbmdsZV8xLlJlY3RhbmdsZS5lbXB0eSgpO1xyXG4gICAgICAgICAgICB2LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIHIgPSByLnVuaW9uKF90aGlzLm5vZGVzW2NdLnJlY3QpOyB9KTtcclxuICAgICAgICAgICAgdi5yZWN0ID0gci5pbmZsYXRlKF90aGlzLmdyb3VwUGFkZGluZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGNvbE1pZHMgPSB0aGlzLm1pZFBvaW50cyh0aGlzLmNvbHMubWFwKGZ1bmN0aW9uIChyKSB7IHJldHVybiByLnBvczsgfSkpO1xyXG4gICAgICAgIHZhciByb3dNaWRzID0gdGhpcy5taWRQb2ludHModGhpcy5yb3dzLm1hcChmdW5jdGlvbiAocikgeyByZXR1cm4gci5wb3M7IH0pKTtcclxuICAgICAgICB2YXIgcm93eCA9IGNvbE1pZHNbMF0sIHJvd1ggPSBjb2xNaWRzW2NvbE1pZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgdmFyIGNvbHkgPSByb3dNaWRzWzBdLCBjb2xZID0gcm93TWlkc1tyb3dNaWRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIHZhciBobGluZXMgPSB0aGlzLnJvd3MubWFwKGZ1bmN0aW9uIChyKSB7IHJldHVybiAoeyB4MTogcm93eCwgeDI6IHJvd1gsIHkxOiByLnBvcywgeTI6IHIucG9zIH0pOyB9KVxyXG4gICAgICAgICAgICAuY29uY2F0KHJvd01pZHMubWFwKGZ1bmN0aW9uIChtKSB7IHJldHVybiAoeyB4MTogcm93eCwgeDI6IHJvd1gsIHkxOiBtLCB5MjogbSB9KTsgfSkpO1xyXG4gICAgICAgIHZhciB2bGluZXMgPSB0aGlzLmNvbHMubWFwKGZ1bmN0aW9uIChjKSB7IHJldHVybiAoeyB4MTogYy5wb3MsIHgyOiBjLnBvcywgeTE6IGNvbHksIHkyOiBjb2xZIH0pOyB9KVxyXG4gICAgICAgICAgICAuY29uY2F0KGNvbE1pZHMubWFwKGZ1bmN0aW9uIChtKSB7IHJldHVybiAoeyB4MTogbSwgeDI6IG0sIHkxOiBjb2x5LCB5MjogY29sWSB9KTsgfSkpO1xyXG4gICAgICAgIHZhciBsaW5lcyA9IGhsaW5lcy5jb25jYXQodmxpbmVzKTtcclxuICAgICAgICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChsKSB7IHJldHVybiBsLnZlcnRzID0gW107IH0pO1xyXG4gICAgICAgIHRoaXMudmVydHMgPSBbXTtcclxuICAgICAgICB0aGlzLmVkZ2VzID0gW107XHJcbiAgICAgICAgaGxpbmVzLmZvckVhY2goZnVuY3Rpb24gKGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcCA9IG5ldyBWZXJ0KF90aGlzLnZlcnRzLmxlbmd0aCwgdi54MSwgaC55MSk7XHJcbiAgICAgICAgICAgICAgICBoLnZlcnRzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICB2LnZlcnRzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy52ZXJ0cy5wdXNoKHApO1xyXG4gICAgICAgICAgICAgICAgdmFyIGkgPSBfdGhpcy5iYWNrVG9Gcm9udC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaS0tID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gX3RoaXMuYmFja1RvRnJvbnRbaV0sIHIgPSBub2RlLnJlY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMocC54IC0gci5jeCgpKSwgZHkgPSBNYXRoLmFicyhwLnkgLSByLmN5KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkeCA8IHIud2lkdGgoKSAvIDIgJiYgZHkgPCByLmhlaWdodCgpIC8gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwLm5vZGUgPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxpbmVzLmZvckVhY2goZnVuY3Rpb24gKGwsIGxpKSB7XHJcbiAgICAgICAgICAgIF90aGlzLm5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgICAgIHYucmVjdC5saW5lSW50ZXJzZWN0aW9ucyhsLngxLCBsLnkxLCBsLngyLCBsLnkyKS5mb3JFYWNoKGZ1bmN0aW9uIChpbnRlcnNlY3QsIGopIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcCA9IG5ldyBWZXJ0KF90aGlzLnZlcnRzLmxlbmd0aCwgaW50ZXJzZWN0LngsIGludGVyc2VjdC55LCB2LCBsKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy52ZXJ0cy5wdXNoKHApO1xyXG4gICAgICAgICAgICAgICAgICAgIGwudmVydHMucHVzaChwKTtcclxuICAgICAgICAgICAgICAgICAgICB2LnBvcnRzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBpc0hvcml6ID0gTWF0aC5hYnMobC55MSAtIGwueTIpIDwgMC4xO1xyXG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gaXNIb3JpeiA/IGIueCAtIGEueCA6IGIueSAtIGEueTsgfTtcclxuICAgICAgICAgICAgbC52ZXJ0cy5zb3J0KGRlbHRhKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsLnZlcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdSA9IGwudmVydHNbaSAtIDFdLCB2ID0gbC52ZXJ0c1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICh1Lm5vZGUgJiYgdS5ub2RlID09PSB2Lm5vZGUgJiYgdS5ub2RlLmxlYWYpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5lZGdlcy5wdXNoKHsgc291cmNlOiB1LmlkLCB0YXJnZXQ6IHYuaWQsIGxlbmd0aDogTWF0aC5hYnMoZGVsdGEodSwgdikpIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBHcmlkUm91dGVyLnByb3RvdHlwZS5hdmcgPSBmdW5jdGlvbiAoYSkgeyByZXR1cm4gYS5yZWR1Y2UoZnVuY3Rpb24gKHgsIHkpIHsgcmV0dXJuIHggKyB5OyB9KSAvIGEubGVuZ3RoOyB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuZ2V0R3JpZExpbmVzID0gZnVuY3Rpb24gKGF4aXMpIHtcclxuICAgICAgICB2YXIgY29sdW1ucyA9IFtdO1xyXG4gICAgICAgIHZhciBscyA9IHRoaXMubGVhdmVzLnNsaWNlKDAsIHRoaXMubGVhdmVzLmxlbmd0aCk7XHJcbiAgICAgICAgd2hpbGUgKGxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdmFyIG92ZXJsYXBwaW5nID0gbHMuZmlsdGVyKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnJlY3RbJ292ZXJsYXAnICsgYXhpcy50b1VwcGVyQ2FzZSgpXShsc1swXS5yZWN0KTsgfSk7XHJcbiAgICAgICAgICAgIHZhciBjb2wgPSB7XHJcbiAgICAgICAgICAgICAgICBub2Rlczogb3ZlcmxhcHBpbmcsXHJcbiAgICAgICAgICAgICAgICBwb3M6IHRoaXMuYXZnKG92ZXJsYXBwaW5nLm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gdi5yZWN0WydjJyArIGF4aXNdKCk7IH0pKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb2x1bW5zLnB1c2goY29sKTtcclxuICAgICAgICAgICAgY29sLm5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGxzLnNwbGljZShscy5pbmRleE9mKHYpLCAxKTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbHVtbnMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS5wb3MgLSBiLnBvczsgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNvbHVtbnM7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuZ2V0RGVwdGggPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBkZXB0aCA9IDA7XHJcbiAgICAgICAgd2hpbGUgKHYucGFyZW50ICE9PSB0aGlzLnJvb3QpIHtcclxuICAgICAgICAgICAgZGVwdGgrKztcclxuICAgICAgICAgICAgdiA9IHYucGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVwdGg7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUubWlkUG9pbnRzID0gZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICB2YXIgZ2FwID0gYVsxXSAtIGFbMF07XHJcbiAgICAgICAgdmFyIG1pZHMgPSBbYVswXSAtIGdhcCAvIDJdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBtaWRzLnB1c2goKGFbaV0gKyBhW2kgLSAxXSkgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWlkcy5wdXNoKGFbYS5sZW5ndGggLSAxXSArIGdhcCAvIDIpO1xyXG4gICAgICAgIHJldHVybiBtaWRzO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIucHJvdG90eXBlLmZpbmRMaW5lYWdlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2YXIgbGluZWFnZSA9IFt2XTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHYgPSB2LnBhcmVudDtcclxuICAgICAgICAgICAgbGluZWFnZS5wdXNoKHYpO1xyXG4gICAgICAgIH0gd2hpbGUgKHYgIT09IHRoaXMucm9vdCk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmVhZ2UucmV2ZXJzZSgpO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIucHJvdG90eXBlLmZpbmRBbmNlc3RvclBhdGhCZXR3ZWVuID0gZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICB2YXIgYWEgPSB0aGlzLmZpbmRMaW5lYWdlKGEpLCBiYSA9IHRoaXMuZmluZExpbmVhZ2UoYiksIGkgPSAwO1xyXG4gICAgICAgIHdoaWxlIChhYVtpXSA9PT0gYmFbaV0pXHJcbiAgICAgICAgICAgIGkrKztcclxuICAgICAgICByZXR1cm4geyBjb21tb25BbmNlc3RvcjogYWFbaSAtIDFdLCBsaW5lYWdlczogYWEuc2xpY2UoaSkuY29uY2F0KGJhLnNsaWNlKGkpKSB9O1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIucHJvdG90eXBlLnNpYmxpbmdPYnN0YWNsZXMgPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHBhdGggPSB0aGlzLmZpbmRBbmNlc3RvclBhdGhCZXR3ZWVuKGEsIGIpO1xyXG4gICAgICAgIHZhciBsaW5lYWdlTG9va3VwID0ge307XHJcbiAgICAgICAgcGF0aC5saW5lYWdlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiBsaW5lYWdlTG9va3VwW3YuaWRdID0ge307IH0pO1xyXG4gICAgICAgIHZhciBvYnN0YWNsZXMgPSBwYXRoLmNvbW1vbkFuY2VzdG9yLmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAodikgeyByZXR1cm4gISh2IGluIGxpbmVhZ2VMb29rdXApOyB9KTtcclxuICAgICAgICBwYXRoLmxpbmVhZ2VzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYucGFyZW50ICE9PSBwYXRoLmNvbW1vbkFuY2VzdG9yOyB9KVxyXG4gICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAodikgeyByZXR1cm4gb2JzdGFjbGVzID0gb2JzdGFjbGVzLmNvbmNhdCh2LnBhcmVudC5jaGlsZHJlbi5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMgIT09IHYuaWQ7IH0pKTsgfSk7XHJcbiAgICAgICAgcmV0dXJuIG9ic3RhY2xlcy5tYXAoZnVuY3Rpb24gKHYpIHsgcmV0dXJuIF90aGlzLm5vZGVzW3ZdOyB9KTtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLmdldFNlZ21lbnRTZXRzID0gZnVuY3Rpb24gKHJvdXRlcywgeCwgeSkge1xyXG4gICAgICAgIHZhciB2c2VnbWVudHMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBlaSA9IDA7IGVpIDwgcm91dGVzLmxlbmd0aDsgZWkrKykge1xyXG4gICAgICAgICAgICB2YXIgcm91dGUgPSByb3V0ZXNbZWldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzaSA9IDA7IHNpIDwgcm91dGUubGVuZ3RoOyBzaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcyA9IHJvdXRlW3NpXTtcclxuICAgICAgICAgICAgICAgIHMuZWRnZWlkID0gZWk7XHJcbiAgICAgICAgICAgICAgICBzLmkgPSBzaTtcclxuICAgICAgICAgICAgICAgIHZhciBzZHggPSBzWzFdW3hdIC0gc1swXVt4XTtcclxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhzZHgpIDwgMC4xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdnNlZ21lbnRzLnB1c2gocyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdnNlZ21lbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGFbMF1beF0gLSBiWzBdW3hdOyB9KTtcclxuICAgICAgICB2YXIgdnNlZ21lbnRzZXRzID0gW107XHJcbiAgICAgICAgdmFyIHNlZ21lbnRzZXQgPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdnNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBzID0gdnNlZ21lbnRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIXNlZ21lbnRzZXQgfHwgTWF0aC5hYnMoc1swXVt4XSAtIHNlZ21lbnRzZXQucG9zKSA+IDAuMSkge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudHNldCA9IHsgcG9zOiBzWzBdW3hdLCBzZWdtZW50czogW10gfTtcclxuICAgICAgICAgICAgICAgIHZzZWdtZW50c2V0cy5wdXNoKHNlZ21lbnRzZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlZ21lbnRzZXQuc2VnbWVudHMucHVzaChzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZzZWdtZW50c2V0cztcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLm51ZGdlU2VncyA9IGZ1bmN0aW9uICh4LCB5LCByb3V0ZXMsIHNlZ21lbnRzLCBsZWZ0T2YsIGdhcCkge1xyXG4gICAgICAgIHZhciBuID0gc2VnbWVudHMubGVuZ3RoO1xyXG4gICAgICAgIGlmIChuIDw9IDEpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgdnMgPSBzZWdtZW50cy5tYXAoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIG5ldyB2cHNjXzEuVmFyaWFibGUoc1swXVt4XSk7IH0pO1xyXG4gICAgICAgIHZhciBjcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gailcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHZhciBzMSA9IHNlZ21lbnRzW2ldLCBzMiA9IHNlZ21lbnRzW2pdLCBlMSA9IHMxLmVkZ2VpZCwgZTIgPSBzMi5lZGdlaWQsIGxpbmQgPSAtMSwgcmluZCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgaWYgKHggPT0gJ3gnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlZnRPZihlMSwgZTIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzMVswXVt5XSA8IHMxWzFdW3ldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5kID0gaiwgcmluZCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5kID0gaSwgcmluZCA9IGo7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVmdE9mKGUxLCBlMikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMxWzBdW3ldIDwgczFbMV1beV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmQgPSBpLCByaW5kID0gajtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmQgPSBqLCByaW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChsaW5kID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjcy5wdXNoKG5ldyB2cHNjXzEuQ29uc3RyYWludCh2c1tsaW5kXSwgdnNbcmluZF0sIGdhcCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzb2x2ZXIgPSBuZXcgdnBzY18xLlNvbHZlcih2cywgY3MpO1xyXG4gICAgICAgIHNvbHZlci5zb2x2ZSgpO1xyXG4gICAgICAgIHZzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgdmFyIHMgPSBzZWdtZW50c1tpXTtcclxuICAgICAgICAgICAgdmFyIHBvcyA9IHYucG9zaXRpb24oKTtcclxuICAgICAgICAgICAgc1swXVt4XSA9IHNbMV1beF0gPSBwb3M7XHJcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tzLmVkZ2VpZF07XHJcbiAgICAgICAgICAgIGlmIChzLmkgPiAwKVxyXG4gICAgICAgICAgICAgICAgcm91dGVbcy5pIC0gMV1bMV1beF0gPSBwb3M7XHJcbiAgICAgICAgICAgIGlmIChzLmkgPCByb3V0ZS5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgICAgICAgcm91dGVbcy5pICsgMV1bMF1beF0gPSBwb3M7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5udWRnZVNlZ21lbnRzID0gZnVuY3Rpb24gKHJvdXRlcywgeCwgeSwgbGVmdE9mLCBnYXApIHtcclxuICAgICAgICB2YXIgdnNlZ21lbnRzZXRzID0gR3JpZFJvdXRlci5nZXRTZWdtZW50U2V0cyhyb3V0ZXMsIHgsIHkpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdnNlZ21lbnRzZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBzcyA9IHZzZWdtZW50c2V0c1tpXTtcclxuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNzLnNlZ21lbnRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcyA9IHNzLnNlZ21lbnRzW2pdO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goeyB0eXBlOiAwLCBzOiBzLCBwb3M6IE1hdGgubWluKHNbMF1beV0sIHNbMV1beV0pIH0pO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goeyB0eXBlOiAxLCBzOiBzLCBwb3M6IE1hdGgubWF4KHNbMF1beV0sIHNbMV1beV0pIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV2ZW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLnBvcyAtIGIucG9zICsgYS50eXBlIC0gYi50eXBlOyB9KTtcclxuICAgICAgICAgICAgdmFyIG9wZW4gPSBbXTtcclxuICAgICAgICAgICAgdmFyIG9wZW5Db3VudCA9IDA7XHJcbiAgICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS50eXBlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3Blbi5wdXNoKGUucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3BlbkNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVuQ291bnQtLTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcGVuQ291bnQgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIEdyaWRSb3V0ZXIubnVkZ2VTZWdzKHgsIHksIHJvdXRlcywgb3BlbiwgbGVmdE9mLCBnYXApO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wZW4gPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIucHJvdG90eXBlLnJvdXRlRWRnZXMgPSBmdW5jdGlvbiAoZWRnZXMsIG51ZGdlR2FwLCBzb3VyY2UsIHRhcmdldCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHJvdXRlUGF0aHMgPSBlZGdlcy5tYXAoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIF90aGlzLnJvdXRlKHNvdXJjZShlKSwgdGFyZ2V0KGUpKTsgfSk7XHJcbiAgICAgICAgdmFyIG9yZGVyID0gR3JpZFJvdXRlci5vcmRlckVkZ2VzKHJvdXRlUGF0aHMpO1xyXG4gICAgICAgIHZhciByb3V0ZXMgPSByb3V0ZVBhdGhzLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gR3JpZFJvdXRlci5tYWtlU2VnbWVudHMoZSk7IH0pO1xyXG4gICAgICAgIEdyaWRSb3V0ZXIubnVkZ2VTZWdtZW50cyhyb3V0ZXMsICd4JywgJ3knLCBvcmRlciwgbnVkZ2VHYXApO1xyXG4gICAgICAgIEdyaWRSb3V0ZXIubnVkZ2VTZWdtZW50cyhyb3V0ZXMsICd5JywgJ3gnLCBvcmRlciwgbnVkZ2VHYXApO1xyXG4gICAgICAgIEdyaWRSb3V0ZXIudW5yZXZlcnNlRWRnZXMocm91dGVzLCByb3V0ZVBhdGhzKTtcclxuICAgICAgICByZXR1cm4gcm91dGVzO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIudW5yZXZlcnNlRWRnZXMgPSBmdW5jdGlvbiAocm91dGVzLCByb3V0ZVBhdGhzKSB7XHJcbiAgICAgICAgcm91dGVzLmZvckVhY2goZnVuY3Rpb24gKHNlZ21lbnRzLCBpKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXRoID0gcm91dGVQYXRoc1tpXTtcclxuICAgICAgICAgICAgaWYgKHBhdGgucmV2ZXJzZWQpIHtcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRzLnJldmVyc2UoKTtcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24gKHNlZ21lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5hbmdsZUJldHdlZW4yTGluZXMgPSBmdW5jdGlvbiAobGluZTEsIGxpbmUyKSB7XHJcbiAgICAgICAgdmFyIGFuZ2xlMSA9IE1hdGguYXRhbjIobGluZTFbMF0ueSAtIGxpbmUxWzFdLnksIGxpbmUxWzBdLnggLSBsaW5lMVsxXS54KTtcclxuICAgICAgICB2YXIgYW5nbGUyID0gTWF0aC5hdGFuMihsaW5lMlswXS55IC0gbGluZTJbMV0ueSwgbGluZTJbMF0ueCAtIGxpbmUyWzFdLngpO1xyXG4gICAgICAgIHZhciBkaWZmID0gYW5nbGUxIC0gYW5nbGUyO1xyXG4gICAgICAgIGlmIChkaWZmID4gTWF0aC5QSSB8fCBkaWZmIDwgLU1hdGguUEkpIHtcclxuICAgICAgICAgICAgZGlmZiA9IGFuZ2xlMiAtIGFuZ2xlMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRpZmY7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5pc0xlZnQgPSBmdW5jdGlvbiAoYSwgYiwgYykge1xyXG4gICAgICAgIHJldHVybiAoKGIueCAtIGEueCkgKiAoYy55IC0gYS55KSAtIChiLnkgLSBhLnkpICogKGMueCAtIGEueCkpIDw9IDA7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5nZXRPcmRlciA9IGZ1bmN0aW9uIChwYWlycykge1xyXG4gICAgICAgIHZhciBvdXRnb2luZyA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHAgPSBwYWlyc1tpXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvdXRnb2luZ1twLmxdID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgICAgIG91dGdvaW5nW3AubF0gPSB7fTtcclxuICAgICAgICAgICAgb3V0Z29pbmdbcC5sXVtwLnJdID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChsLCByKSB7IHJldHVybiB0eXBlb2Ygb3V0Z29pbmdbbF0gIT09ICd1bmRlZmluZWQnICYmIG91dGdvaW5nW2xdW3JdOyB9O1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIub3JkZXJFZGdlcyA9IGZ1bmN0aW9uIChlZGdlcykge1xyXG4gICAgICAgIHZhciBlZGdlT3JkZXIgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVkZ2VzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCBlZGdlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGUgPSBlZGdlc1tpXSwgZiA9IGVkZ2VzW2pdLCBsY3MgPSBuZXcgTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlKGUsIGYpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHUsIHZpLCB2ajtcclxuICAgICAgICAgICAgICAgIGlmIChsY3MubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxjcy5yZXZlcnNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGYucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGYucmV2ZXJzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGxjcyA9IG5ldyBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UoZSwgZik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKGxjcy5zaSA8PSAwIHx8IGxjcy50aSA8PSAwKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIChsY3Muc2kgKyBsY3MubGVuZ3RoID49IGUubGVuZ3RoIHx8IGxjcy50aSArIGxjcy5sZW5ndGggPj0gZi5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRnZU9yZGVyLnB1c2goeyBsOiBpLCByOiBqIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGxjcy5zaSArIGxjcy5sZW5ndGggPj0gZS5sZW5ndGggfHwgbGNzLnRpICsgbGNzLmxlbmd0aCA+PSBmLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHUgPSBlW2xjcy5zaSArIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZqID0gZVtsY3Muc2kgLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICB2aSA9IGZbbGNzLnRpIC0gMV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB1ID0gZVtsY3Muc2kgKyBsY3MubGVuZ3RoIC0gMl07XHJcbiAgICAgICAgICAgICAgICAgICAgdmkgPSBlW2xjcy5zaSArIGxjcy5sZW5ndGhdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZqID0gZltsY3MudGkgKyBsY3MubGVuZ3RoXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChHcmlkUm91dGVyLmlzTGVmdCh1LCB2aSwgdmopKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRnZU9yZGVyLnB1c2goeyBsOiBqLCByOiBpIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRnZU9yZGVyLnB1c2goeyBsOiBpLCByOiBqIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBHcmlkUm91dGVyLmdldE9yZGVyKGVkZ2VPcmRlcik7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5tYWtlU2VnbWVudHMgPSBmdW5jdGlvbiAocGF0aCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGNvcHlQb2ludChwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHg6IHAueCwgeTogcC55IH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBpc1N0cmFpZ2h0ID0gZnVuY3Rpb24gKGEsIGIsIGMpIHsgcmV0dXJuIE1hdGguYWJzKChiLnggLSBhLngpICogKGMueSAtIGEueSkgLSAoYi55IC0gYS55KSAqIChjLnggLSBhLngpKSA8IDAuMDAxOyB9O1xyXG4gICAgICAgIHZhciBzZWdtZW50cyA9IFtdO1xyXG4gICAgICAgIHZhciBhID0gY29weVBvaW50KHBhdGhbMF0pO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYiA9IGNvcHlQb2ludChwYXRoW2ldKSwgYyA9IGkgPCBwYXRoLmxlbmd0aCAtIDEgPyBwYXRoW2kgKyAxXSA6IG51bGw7XHJcbiAgICAgICAgICAgIGlmICghYyB8fCAhaXNTdHJhaWdodChhLCBiLCBjKSkge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaChbYSwgYl0pO1xyXG4gICAgICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIucHJvdG90eXBlLnJvdXRlID0gZnVuY3Rpb24gKHMsIHQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzb3VyY2UgPSB0aGlzLm5vZGVzW3NdLCB0YXJnZXQgPSB0aGlzLm5vZGVzW3RdO1xyXG4gICAgICAgIHRoaXMub2JzdGFjbGVzID0gdGhpcy5zaWJsaW5nT2JzdGFjbGVzKHNvdXJjZSwgdGFyZ2V0KTtcclxuICAgICAgICB2YXIgb2JzdGFjbGVMb29rdXAgPSB7fTtcclxuICAgICAgICB0aGlzLm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7IHJldHVybiBvYnN0YWNsZUxvb2t1cFtvLmlkXSA9IG87IH0pO1xyXG4gICAgICAgIHRoaXMucGFzc2FibGVFZGdlcyA9IHRoaXMuZWRnZXMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciB1ID0gX3RoaXMudmVydHNbZS5zb3VyY2VdLCB2ID0gX3RoaXMudmVydHNbZS50YXJnZXRdO1xyXG4gICAgICAgICAgICByZXR1cm4gISh1Lm5vZGUgJiYgdS5ub2RlLmlkIGluIG9ic3RhY2xlTG9va3VwXHJcbiAgICAgICAgICAgICAgICB8fCB2Lm5vZGUgJiYgdi5ub2RlLmlkIGluIG9ic3RhY2xlTG9va3VwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHNvdXJjZS5wb3J0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdSA9IHNvdXJjZS5wb3J0c1swXS5pZDtcclxuICAgICAgICAgICAgdmFyIHYgPSBzb3VyY2UucG9ydHNbaV0uaWQ7XHJcbiAgICAgICAgICAgIHRoaXMucGFzc2FibGVFZGdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogdSxcclxuICAgICAgICAgICAgICAgIHRhcmdldDogdixcclxuICAgICAgICAgICAgICAgIGxlbmd0aDogMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0YXJnZXQucG9ydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHUgPSB0YXJnZXQucG9ydHNbMF0uaWQ7XHJcbiAgICAgICAgICAgIHZhciB2ID0gdGFyZ2V0LnBvcnRzW2ldLmlkO1xyXG4gICAgICAgICAgICB0aGlzLnBhc3NhYmxlRWRnZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHUsXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHYsXHJcbiAgICAgICAgICAgICAgICBsZW5ndGg6IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBnZXRTb3VyY2UgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5zb3VyY2U7IH0sIGdldFRhcmdldCA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnRhcmdldDsgfSwgZ2V0TGVuZ3RoID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUubGVuZ3RoOyB9O1xyXG4gICAgICAgIHZhciBzaG9ydGVzdFBhdGhDYWxjdWxhdG9yID0gbmV3IHNob3J0ZXN0cGF0aHNfMS5DYWxjdWxhdG9yKHRoaXMudmVydHMubGVuZ3RoLCB0aGlzLnBhc3NhYmxlRWRnZXMsIGdldFNvdXJjZSwgZ2V0VGFyZ2V0LCBnZXRMZW5ndGgpO1xyXG4gICAgICAgIHZhciBiZW5kUGVuYWx0eSA9IGZ1bmN0aW9uICh1LCB2LCB3KSB7XHJcbiAgICAgICAgICAgIHZhciBhID0gX3RoaXMudmVydHNbdV0sIGIgPSBfdGhpcy52ZXJ0c1t2XSwgYyA9IF90aGlzLnZlcnRzW3ddO1xyXG4gICAgICAgICAgICB2YXIgZHggPSBNYXRoLmFicyhjLnggLSBhLngpLCBkeSA9IE1hdGguYWJzKGMueSAtIGEueSk7XHJcbiAgICAgICAgICAgIGlmIChhLm5vZGUgPT09IHNvdXJjZSAmJiBhLm5vZGUgPT09IGIubm9kZSB8fCBiLm5vZGUgPT09IHRhcmdldCAmJiBiLm5vZGUgPT09IGMubm9kZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICByZXR1cm4gZHggPiAxICYmIGR5ID4gMSA/IDEwMDAgOiAwO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHNob3J0ZXN0UGF0aCA9IHNob3J0ZXN0UGF0aENhbGN1bGF0b3IuUGF0aEZyb21Ob2RlVG9Ob2RlV2l0aFByZXZDb3N0KHNvdXJjZS5wb3J0c1swXS5pZCwgdGFyZ2V0LnBvcnRzWzBdLmlkLCBiZW5kUGVuYWx0eSk7XHJcbiAgICAgICAgdmFyIHBhdGhQb2ludHMgPSBzaG9ydGVzdFBhdGgucmV2ZXJzZSgpLm1hcChmdW5jdGlvbiAodmkpIHsgcmV0dXJuIF90aGlzLnZlcnRzW3ZpXTsgfSk7XHJcbiAgICAgICAgcGF0aFBvaW50cy5wdXNoKHRoaXMubm9kZXNbdGFyZ2V0LmlkXS5wb3J0c1swXSk7XHJcbiAgICAgICAgcmV0dXJuIHBhdGhQb2ludHMuZmlsdGVyKGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhKGkgPCBwYXRoUG9pbnRzLmxlbmd0aCAtIDEgJiYgcGF0aFBvaW50c1tpICsgMV0ubm9kZSA9PT0gc291cmNlICYmIHYubm9kZSA9PT0gc291cmNlXHJcbiAgICAgICAgICAgICAgICB8fCBpID4gMCAmJiB2Lm5vZGUgPT09IHRhcmdldCAmJiBwYXRoUG9pbnRzW2kgLSAxXS5ub2RlID09PSB0YXJnZXQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIuZ2V0Um91dGVQYXRoID0gZnVuY3Rpb24gKHJvdXRlLCBjb3JuZXJyYWRpdXMsIGFycm93d2lkdGgsIGFycm93aGVpZ2h0KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICAgICAgcm91dGVwYXRoOiAnTSAnICsgcm91dGVbMF1bMF0ueCArICcgJyArIHJvdXRlWzBdWzBdLnkgKyAnICcsXHJcbiAgICAgICAgICAgIGFycm93cGF0aDogJydcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChyb3V0ZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm91dGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaSA9IHJvdXRlW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHggPSBsaVsxXS54LCB5ID0gbGlbMV0ueTtcclxuICAgICAgICAgICAgICAgIHZhciBkeCA9IHggLSBsaVswXS54O1xyXG4gICAgICAgICAgICAgICAgdmFyIGR5ID0geSAtIGxpWzBdLnk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaSA8IHJvdXRlLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZHgpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4IC09IGR4IC8gTWF0aC5hYnMoZHgpICogY29ybmVycmFkaXVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeSAtPSBkeSAvIE1hdGguYWJzKGR5KSAqIGNvcm5lcnJhZGl1cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnJvdXRlcGF0aCArPSAnTCAnICsgeCArICcgJyArIHkgKyAnICc7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGwgPSByb3V0ZVtpICsgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHgwID0gbFswXS54LCB5MCA9IGxbMF0ueTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeDEgPSBsWzFdLng7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHkxID0gbFsxXS55O1xyXG4gICAgICAgICAgICAgICAgICAgIGR4ID0geDEgLSB4MDtcclxuICAgICAgICAgICAgICAgICAgICBkeSA9IHkxIC0geTA7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gR3JpZFJvdXRlci5hbmdsZUJldHdlZW4yTGluZXMobGksIGwpIDwgMCA/IDEgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB4MiwgeTI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGR4KSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSB4MCArIGR4IC8gTWF0aC5hYnMoZHgpICogY29ybmVycmFkaXVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5MiA9IHkwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSB4MDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTIgPSB5MCArIGR5IC8gTWF0aC5hYnMoZHkpICogY29ybmVycmFkaXVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3ggPSBNYXRoLmFicyh4MiAtIHgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjeSA9IE1hdGguYWJzKHkyIC0geSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnJvdXRlcGF0aCArPSAnQSAnICsgY3ggKyAnICcgKyBjeSArICcgMCAwICcgKyBhbmdsZSArICcgJyArIHgyICsgJyAnICsgeTIgKyAnICc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyb3d0aXAgPSBbeCwgeV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFycm93Y29ybmVyMSwgYXJyb3djb3JuZXIyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhkeCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHggLT0gZHggLyBNYXRoLmFicyhkeCkgKiBhcnJvd2hlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3djb3JuZXIxID0gW3gsIHkgKyBhcnJvd3dpZHRoXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3djb3JuZXIyID0gW3gsIHkgLSBhcnJvd3dpZHRoXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgLT0gZHkgLyBNYXRoLmFicyhkeSkgKiBhcnJvd2hlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3djb3JuZXIxID0gW3ggKyBhcnJvd3dpZHRoLCB5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3djb3JuZXIyID0gW3ggLSBhcnJvd3dpZHRoLCB5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnJvdXRlcGF0aCArPSAnTCAnICsgeCArICcgJyArIHkgKyAnICc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFycm93aGVpZ2h0ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuYXJyb3dwYXRoID0gJ00gJyArIGFycm93dGlwWzBdICsgJyAnICsgYXJyb3d0aXBbMV0gKyAnIEwgJyArIGFycm93Y29ybmVyMVswXSArICcgJyArIGFycm93Y29ybmVyMVsxXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnIEwgJyArIGFycm93Y29ybmVyMlswXSArICcgJyArIGFycm93Y29ybmVyMlsxXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBsaSA9IHJvdXRlWzBdO1xyXG4gICAgICAgICAgICB2YXIgeCA9IGxpWzFdLngsIHkgPSBsaVsxXS55O1xyXG4gICAgICAgICAgICB2YXIgZHggPSB4IC0gbGlbMF0ueDtcclxuICAgICAgICAgICAgdmFyIGR5ID0geSAtIGxpWzBdLnk7XHJcbiAgICAgICAgICAgIHZhciBhcnJvd3RpcCA9IFt4LCB5XTtcclxuICAgICAgICAgICAgdmFyIGFycm93Y29ybmVyMSwgYXJyb3djb3JuZXIyO1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZHgpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgeCAtPSBkeCAvIE1hdGguYWJzKGR4KSAqIGFycm93aGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgYXJyb3djb3JuZXIxID0gW3gsIHkgKyBhcnJvd3dpZHRoXTtcclxuICAgICAgICAgICAgICAgIGFycm93Y29ybmVyMiA9IFt4LCB5IC0gYXJyb3d3aWR0aF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB5IC09IGR5IC8gTWF0aC5hYnMoZHkpICogYXJyb3doZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjEgPSBbeCArIGFycm93d2lkdGgsIHldO1xyXG4gICAgICAgICAgICAgICAgYXJyb3djb3JuZXIyID0gW3ggLSBhcnJvd3dpZHRoLCB5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQucm91dGVwYXRoICs9ICdMICcgKyB4ICsgJyAnICsgeSArICcgJztcclxuICAgICAgICAgICAgaWYgKGFycm93aGVpZ2h0ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmFycm93cGF0aCA9ICdNICcgKyBhcnJvd3RpcFswXSArICcgJyArIGFycm93dGlwWzFdICsgJyBMICcgKyBhcnJvd2Nvcm5lcjFbMF0gKyAnICcgKyBhcnJvd2Nvcm5lcjFbMV1cclxuICAgICAgICAgICAgICAgICAgICArICcgTCAnICsgYXJyb3djb3JuZXIyWzBdICsgJyAnICsgYXJyb3djb3JuZXIyWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEdyaWRSb3V0ZXI7XHJcbn0oKSk7XHJcbmV4cG9ydHMuR3JpZFJvdXRlciA9IEdyaWRSb3V0ZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdyaWRyb3V0ZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHBhY2tpbmdPcHRpb25zID0ge1xyXG4gICAgUEFERElORzogMTAsXHJcbiAgICBHT0xERU5fU0VDVElPTjogKDEgKyBNYXRoLnNxcnQoNSkpIC8gMixcclxuICAgIEZMT0FUX0VQU0lMT046IDAuMDAwMSxcclxuICAgIE1BWF9JTkVSQVRJT05TOiAxMDBcclxufTtcclxuZnVuY3Rpb24gYXBwbHlQYWNraW5nKGdyYXBocywgdywgaCwgbm9kZV9zaXplLCBkZXNpcmVkX3JhdGlvKSB7XHJcbiAgICBpZiAoZGVzaXJlZF9yYXRpbyA9PT0gdm9pZCAwKSB7IGRlc2lyZWRfcmF0aW8gPSAxOyB9XHJcbiAgICB2YXIgaW5pdF94ID0gMCwgaW5pdF95ID0gMCwgc3ZnX3dpZHRoID0gdywgc3ZnX2hlaWdodCA9IGgsIGRlc2lyZWRfcmF0aW8gPSB0eXBlb2YgZGVzaXJlZF9yYXRpbyAhPT0gJ3VuZGVmaW5lZCcgPyBkZXNpcmVkX3JhdGlvIDogMSwgbm9kZV9zaXplID0gdHlwZW9mIG5vZGVfc2l6ZSAhPT0gJ3VuZGVmaW5lZCcgPyBub2RlX3NpemUgOiAwLCByZWFsX3dpZHRoID0gMCwgcmVhbF9oZWlnaHQgPSAwLCBtaW5fd2lkdGggPSAwLCBnbG9iYWxfYm90dG9tID0gMCwgbGluZSA9IFtdO1xyXG4gICAgaWYgKGdyYXBocy5sZW5ndGggPT0gMClcclxuICAgICAgICByZXR1cm47XHJcbiAgICBjYWxjdWxhdGVfYmIoZ3JhcGhzKTtcclxuICAgIGFwcGx5KGdyYXBocywgZGVzaXJlZF9yYXRpbyk7XHJcbiAgICBwdXRfbm9kZXNfdG9fcmlnaHRfcG9zaXRpb25zKGdyYXBocyk7XHJcbiAgICBmdW5jdGlvbiBjYWxjdWxhdGVfYmIoZ3JhcGhzKSB7XHJcbiAgICAgICAgZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgY2FsY3VsYXRlX3NpbmdsZV9iYihnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVfc2luZ2xlX2JiKGdyYXBoKSB7XHJcbiAgICAgICAgICAgIHZhciBtaW5feCA9IE51bWJlci5NQVhfVkFMVUUsIG1pbl95ID0gTnVtYmVyLk1BWF9WQUxVRSwgbWF4X3ggPSAwLCBtYXhfeSA9IDA7XHJcbiAgICAgICAgICAgIGdyYXBoLmFycmF5LmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3ID0gdHlwZW9mIHYud2lkdGggIT09ICd1bmRlZmluZWQnID8gdi53aWR0aCA6IG5vZGVfc2l6ZTtcclxuICAgICAgICAgICAgICAgIHZhciBoID0gdHlwZW9mIHYuaGVpZ2h0ICE9PSAndW5kZWZpbmVkJyA/IHYuaGVpZ2h0IDogbm9kZV9zaXplO1xyXG4gICAgICAgICAgICAgICAgdyAvPSAyO1xyXG4gICAgICAgICAgICAgICAgaCAvPSAyO1xyXG4gICAgICAgICAgICAgICAgbWF4X3ggPSBNYXRoLm1heCh2LnggKyB3LCBtYXhfeCk7XHJcbiAgICAgICAgICAgICAgICBtaW5feCA9IE1hdGgubWluKHYueCAtIHcsIG1pbl94KTtcclxuICAgICAgICAgICAgICAgIG1heF95ID0gTWF0aC5tYXgodi55ICsgaCwgbWF4X3kpO1xyXG4gICAgICAgICAgICAgICAgbWluX3kgPSBNYXRoLm1pbih2LnkgLSBoLCBtaW5feSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBncmFwaC53aWR0aCA9IG1heF94IC0gbWluX3g7XHJcbiAgICAgICAgICAgIGdyYXBoLmhlaWdodCA9IG1heF95IC0gbWluX3k7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcHV0X25vZGVzX3RvX3JpZ2h0X3Bvc2l0aW9ucyhncmFwaHMpIHtcclxuICAgICAgICBncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICB2YXIgY2VudGVyID0geyB4OiAwLCB5OiAwIH07XHJcbiAgICAgICAgICAgIGcuYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyLnggKz0gbm9kZS54O1xyXG4gICAgICAgICAgICAgICAgY2VudGVyLnkgKz0gbm9kZS55O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2VudGVyLnggLz0gZy5hcnJheS5sZW5ndGg7XHJcbiAgICAgICAgICAgIGNlbnRlci55IC89IGcuYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgY29ybmVyID0geyB4OiBjZW50ZXIueCAtIGcud2lkdGggLyAyLCB5OiBjZW50ZXIueSAtIGcuaGVpZ2h0IC8gMiB9O1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0geyB4OiBnLnggLSBjb3JuZXIueCArIHN2Z193aWR0aCAvIDIgLSByZWFsX3dpZHRoIC8gMiwgeTogZy55IC0gY29ybmVyLnkgKyBzdmdfaGVpZ2h0IC8gMiAtIHJlYWxfaGVpZ2h0IC8gMiB9O1xyXG4gICAgICAgICAgICBnLmFycmF5LmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUueCArPSBvZmZzZXQueDtcclxuICAgICAgICAgICAgICAgIG5vZGUueSArPSBvZmZzZXQueTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBhcHBseShkYXRhLCBkZXNpcmVkX3JhdGlvKSB7XHJcbiAgICAgICAgdmFyIGN1cnJfYmVzdF9mID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgICAgIHZhciBjdXJyX2Jlc3QgPSAwO1xyXG4gICAgICAgIGRhdGEuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYi5oZWlnaHQgLSBhLmhlaWdodDsgfSk7XHJcbiAgICAgICAgbWluX3dpZHRoID0gZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEud2lkdGggPCBiLndpZHRoID8gYS53aWR0aCA6IGIud2lkdGg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGxlZnQgPSB4MSA9IG1pbl93aWR0aDtcclxuICAgICAgICB2YXIgcmlnaHQgPSB4MiA9IGdldF9lbnRpcmVfd2lkdGgoZGF0YSk7XHJcbiAgICAgICAgdmFyIGl0ZXJhdGlvbkNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHZhciBmX3gxID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICB2YXIgZl94MiA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgdmFyIGZsYWcgPSAtMTtcclxuICAgICAgICB2YXIgZHggPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIHZhciBkZiA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgd2hpbGUgKChkeCA+IG1pbl93aWR0aCkgfHwgZGYgPiBwYWNraW5nT3B0aW9ucy5GTE9BVF9FUFNJTE9OKSB7XHJcbiAgICAgICAgICAgIGlmIChmbGFnICE9IDEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB4MSA9IHJpZ2h0IC0gKHJpZ2h0IC0gbGVmdCkgLyBwYWNraW5nT3B0aW9ucy5HT0xERU5fU0VDVElPTjtcclxuICAgICAgICAgICAgICAgIHZhciBmX3gxID0gc3RlcChkYXRhLCB4MSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZsYWcgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHgyID0gbGVmdCArIChyaWdodCAtIGxlZnQpIC8gcGFja2luZ09wdGlvbnMuR09MREVOX1NFQ1RJT047XHJcbiAgICAgICAgICAgICAgICB2YXIgZl94MiA9IHN0ZXAoZGF0YSwgeDIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGR4ID0gTWF0aC5hYnMoeDEgLSB4Mik7XHJcbiAgICAgICAgICAgIGRmID0gTWF0aC5hYnMoZl94MSAtIGZfeDIpO1xyXG4gICAgICAgICAgICBpZiAoZl94MSA8IGN1cnJfYmVzdF9mKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyX2Jlc3RfZiA9IGZfeDE7XHJcbiAgICAgICAgICAgICAgICBjdXJyX2Jlc3QgPSB4MTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZl94MiA8IGN1cnJfYmVzdF9mKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyX2Jlc3RfZiA9IGZfeDI7XHJcbiAgICAgICAgICAgICAgICBjdXJyX2Jlc3QgPSB4MjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZl94MSA+IGZfeDIpIHtcclxuICAgICAgICAgICAgICAgIGxlZnQgPSB4MTtcclxuICAgICAgICAgICAgICAgIHgxID0geDI7XHJcbiAgICAgICAgICAgICAgICBmX3gxID0gZl94MjtcclxuICAgICAgICAgICAgICAgIGZsYWcgPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmlnaHQgPSB4MjtcclxuICAgICAgICAgICAgICAgIHgyID0geDE7XHJcbiAgICAgICAgICAgICAgICBmX3gyID0gZl94MTtcclxuICAgICAgICAgICAgICAgIGZsYWcgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpdGVyYXRpb25Db3VudGVyKysgPiAxMDApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0ZXAoZGF0YSwgY3Vycl9iZXN0KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAoZGF0YSwgbWF4X3dpZHRoKSB7XHJcbiAgICAgICAgbGluZSA9IFtdO1xyXG4gICAgICAgIHJlYWxfd2lkdGggPSAwO1xyXG4gICAgICAgIHJlYWxfaGVpZ2h0ID0gMDtcclxuICAgICAgICBnbG9iYWxfYm90dG9tID0gaW5pdF95O1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgbyA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIHB1dF9yZWN0KG8sIG1heF93aWR0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBNYXRoLmFicyhnZXRfcmVhbF9yYXRpbygpIC0gZGVzaXJlZF9yYXRpbyk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBwdXRfcmVjdChyZWN0LCBtYXhfd2lkdGgpIHtcclxuICAgICAgICB2YXIgcGFyZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoKGxpbmVbaV0uc3BhY2VfbGVmdCA+PSByZWN0LmhlaWdodCkgJiYgKGxpbmVbaV0ueCArIGxpbmVbaV0ud2lkdGggKyByZWN0LndpZHRoICsgcGFja2luZ09wdGlvbnMuUEFERElORyAtIG1heF93aWR0aCkgPD0gcGFja2luZ09wdGlvbnMuRkxPQVRfRVBTSUxPTikge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gbGluZVtpXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpbmUucHVzaChyZWN0KTtcclxuICAgICAgICBpZiAocGFyZW50ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gcGFyZW50LnggKyBwYXJlbnQud2lkdGggKyBwYWNraW5nT3B0aW9ucy5QQURESU5HO1xyXG4gICAgICAgICAgICByZWN0LnkgPSBwYXJlbnQuYm90dG9tO1xyXG4gICAgICAgICAgICByZWN0LnNwYWNlX2xlZnQgPSByZWN0LmhlaWdodDtcclxuICAgICAgICAgICAgcmVjdC5ib3R0b20gPSByZWN0Lnk7XHJcbiAgICAgICAgICAgIHBhcmVudC5zcGFjZV9sZWZ0IC09IHJlY3QuaGVpZ2h0ICsgcGFja2luZ09wdGlvbnMuUEFERElORztcclxuICAgICAgICAgICAgcGFyZW50LmJvdHRvbSArPSByZWN0LmhlaWdodCArIHBhY2tpbmdPcHRpb25zLlBBRERJTkc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZWN0LnkgPSBnbG9iYWxfYm90dG9tO1xyXG4gICAgICAgICAgICBnbG9iYWxfYm90dG9tICs9IHJlY3QuaGVpZ2h0ICsgcGFja2luZ09wdGlvbnMuUEFERElORztcclxuICAgICAgICAgICAgcmVjdC54ID0gaW5pdF94O1xyXG4gICAgICAgICAgICByZWN0LmJvdHRvbSA9IHJlY3QueTtcclxuICAgICAgICAgICAgcmVjdC5zcGFjZV9sZWZ0ID0gcmVjdC5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWN0LnkgKyByZWN0LmhlaWdodCAtIHJlYWxfaGVpZ2h0ID4gLXBhY2tpbmdPcHRpb25zLkZMT0FUX0VQU0lMT04pXHJcbiAgICAgICAgICAgIHJlYWxfaGVpZ2h0ID0gcmVjdC55ICsgcmVjdC5oZWlnaHQgLSBpbml0X3k7XHJcbiAgICAgICAgaWYgKHJlY3QueCArIHJlY3Qud2lkdGggLSByZWFsX3dpZHRoID4gLXBhY2tpbmdPcHRpb25zLkZMT0FUX0VQU0lMT04pXHJcbiAgICAgICAgICAgIHJlYWxfd2lkdGggPSByZWN0LnggKyByZWN0LndpZHRoIC0gaW5pdF94O1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgZnVuY3Rpb24gZ2V0X2VudGlyZV93aWR0aChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gMDtcclxuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGQpIHsgcmV0dXJuIHdpZHRoICs9IGQud2lkdGggKyBwYWNraW5nT3B0aW9ucy5QQURESU5HOyB9KTtcclxuICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRfcmVhbF9yYXRpbygpIHtcclxuICAgICAgICByZXR1cm4gKHJlYWxfd2lkdGggLyByZWFsX2hlaWdodCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5hcHBseVBhY2tpbmcgPSBhcHBseVBhY2tpbmc7XHJcbmZ1bmN0aW9uIHNlcGFyYXRlR3JhcGhzKG5vZGVzLCBsaW5rcykge1xyXG4gICAgdmFyIG1hcmtzID0ge307XHJcbiAgICB2YXIgd2F5cyA9IHt9O1xyXG4gICAgdmFyIGdyYXBocyA9IFtdO1xyXG4gICAgdmFyIGNsdXN0ZXJzID0gMDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlua3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbGluayA9IGxpbmtzW2ldO1xyXG4gICAgICAgIHZhciBuMSA9IGxpbmsuc291cmNlO1xyXG4gICAgICAgIHZhciBuMiA9IGxpbmsudGFyZ2V0O1xyXG4gICAgICAgIGlmICh3YXlzW24xLmluZGV4XSlcclxuICAgICAgICAgICAgd2F5c1tuMS5pbmRleF0ucHVzaChuMik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB3YXlzW24xLmluZGV4XSA9IFtuMl07XHJcbiAgICAgICAgaWYgKHdheXNbbjIuaW5kZXhdKVxyXG4gICAgICAgICAgICB3YXlzW24yLmluZGV4XS5wdXNoKG4xKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHdheXNbbjIuaW5kZXhdID0gW24xXTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICAgIGlmIChtYXJrc1tub2RlLmluZGV4XSlcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgZXhwbG9yZV9ub2RlKG5vZGUsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZXhwbG9yZV9ub2RlKG4sIGlzX25ldykge1xyXG4gICAgICAgIGlmIChtYXJrc1tuLmluZGV4XSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKGlzX25ldykge1xyXG4gICAgICAgICAgICBjbHVzdGVycysrO1xyXG4gICAgICAgICAgICBncmFwaHMucHVzaCh7IGFycmF5OiBbXSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWFya3Nbbi5pbmRleF0gPSBjbHVzdGVycztcclxuICAgICAgICBncmFwaHNbY2x1c3RlcnMgLSAxXS5hcnJheS5wdXNoKG4pO1xyXG4gICAgICAgIHZhciBhZGphY2VudCA9IHdheXNbbi5pbmRleF07XHJcbiAgICAgICAgaWYgKCFhZGphY2VudClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWRqYWNlbnQubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgZXhwbG9yZV9ub2RlKGFkamFjZW50W2pdLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGdyYXBocztcclxufVxyXG5leHBvcnRzLnNlcGFyYXRlR3JhcGhzID0gc2VwYXJhdGVHcmFwaHM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhhbmRsZWRpc2Nvbm5lY3RlZC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgcG93ZXJncmFwaCA9IHJlcXVpcmUoXCIuL3Bvd2VyZ3JhcGhcIik7XHJcbnZhciBsaW5rbGVuZ3Roc18xID0gcmVxdWlyZShcIi4vbGlua2xlbmd0aHNcIik7XHJcbnZhciBkZXNjZW50XzEgPSByZXF1aXJlKFwiLi9kZXNjZW50XCIpO1xyXG52YXIgcmVjdGFuZ2xlXzEgPSByZXF1aXJlKFwiLi9yZWN0YW5nbGVcIik7XHJcbnZhciBzaG9ydGVzdHBhdGhzXzEgPSByZXF1aXJlKFwiLi9zaG9ydGVzdHBhdGhzXCIpO1xyXG52YXIgZ2VvbV8xID0gcmVxdWlyZShcIi4vZ2VvbVwiKTtcclxudmFyIGhhbmRsZWRpc2Nvbm5lY3RlZF8xID0gcmVxdWlyZShcIi4vaGFuZGxlZGlzY29ubmVjdGVkXCIpO1xyXG52YXIgRXZlbnRUeXBlO1xyXG4oZnVuY3Rpb24gKEV2ZW50VHlwZSkge1xyXG4gICAgRXZlbnRUeXBlW0V2ZW50VHlwZVtcInN0YXJ0XCJdID0gMF0gPSBcInN0YXJ0XCI7XHJcbiAgICBFdmVudFR5cGVbRXZlbnRUeXBlW1widGlja1wiXSA9IDFdID0gXCJ0aWNrXCI7XHJcbiAgICBFdmVudFR5cGVbRXZlbnRUeXBlW1wiZW5kXCJdID0gMl0gPSBcImVuZFwiO1xyXG59KShFdmVudFR5cGUgPSBleHBvcnRzLkV2ZW50VHlwZSB8fCAoZXhwb3J0cy5FdmVudFR5cGUgPSB7fSkpO1xyXG47XHJcbmZ1bmN0aW9uIGlzR3JvdXAoZykge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBnLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGcuZ3JvdXBzICE9PSAndW5kZWZpbmVkJztcclxufVxyXG52YXIgTGF5b3V0ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExheW91dCgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuX2NhbnZhc1NpemUgPSBbMSwgMV07XHJcbiAgICAgICAgdGhpcy5fbGlua0Rpc3RhbmNlID0gMjA7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdE5vZGVTaXplID0gMTA7XHJcbiAgICAgICAgdGhpcy5fbGlua0xlbmd0aENhbGN1bGF0b3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2xpbmtUeXBlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9hdm9pZE92ZXJsYXBzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlRGlzY29ubmVjdGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9ydW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fbm9kZXMgPSBbXTtcclxuICAgICAgICB0aGlzLl9ncm91cHMgPSBbXTtcclxuICAgICAgICB0aGlzLl9yb290R3JvdXAgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2xpbmtzID0gW107XHJcbiAgICAgICAgdGhpcy5fY29uc3RyYWludHMgPSBbXTtcclxuICAgICAgICB0aGlzLl9kaXN0YW5jZU1hdHJpeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZGlyZWN0ZWRMaW5rQ29uc3RyYWludHMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3RocmVzaG9sZCA9IDAuMDE7XHJcbiAgICAgICAgdGhpcy5fdmlzaWJpbGl0eUdyYXBoID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9ncm91cENvbXBhY3RuZXNzID0gMWUtNjtcclxuICAgICAgICB0aGlzLmV2ZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxpbmtBY2Nlc3NvciA9IHtcclxuICAgICAgICAgICAgZ2V0U291cmNlSW5kZXg6IExheW91dC5nZXRTb3VyY2VJbmRleCxcclxuICAgICAgICAgICAgZ2V0VGFyZ2V0SW5kZXg6IExheW91dC5nZXRUYXJnZXRJbmRleCxcclxuICAgICAgICAgICAgc2V0TGVuZ3RoOiBMYXlvdXQuc2V0TGlua0xlbmd0aCxcclxuICAgICAgICAgICAgZ2V0VHlwZTogZnVuY3Rpb24gKGwpIHsgcmV0dXJuIHR5cGVvZiBfdGhpcy5fbGlua1R5cGUgPT09IFwiZnVuY3Rpb25cIiA/IF90aGlzLl9saW5rVHlwZShsKSA6IDA7IH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICghdGhpcy5ldmVudClcclxuICAgICAgICAgICAgdGhpcy5ldmVudCA9IHt9O1xyXG4gICAgICAgIGlmICh0eXBlb2YgZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFtFdmVudFR5cGVbZV1dID0gbGlzdGVuZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50W2VdID0gbGlzdGVuZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZXZlbnQgJiYgdHlwZW9mIHRoaXMuZXZlbnRbZS50eXBlXSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFtlLnR5cGVdKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmtpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgd2hpbGUgKCF0aGlzLnRpY2soKSlcclxuICAgICAgICAgICAgO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fYWxwaGEgPCB0aGlzLl90aHJlc2hvbGQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcnVubmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoeyB0eXBlOiBFdmVudFR5cGUuZW5kLCBhbHBoYTogdGhpcy5fYWxwaGEgPSAwLCBzdHJlc3M6IHRoaXMuX2xhc3RTdHJlc3MgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbiA9IHRoaXMuX25vZGVzLmxlbmd0aCwgbSA9IHRoaXMuX2xpbmtzLmxlbmd0aDtcclxuICAgICAgICB2YXIgbywgaTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50LmxvY2tzLmNsZWFyKCk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICBvID0gdGhpcy5fbm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChvLmZpeGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG8ucHggPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBvLnB5ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG8ucHggPSBvLng7XHJcbiAgICAgICAgICAgICAgICAgICAgby5weSA9IG8ueTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBwID0gW28ucHgsIG8ucHldO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5sb2Nrcy5hZGQoaSwgcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHMxID0gdGhpcy5fZGVzY2VudC5ydW5nZUt1dHRhKCk7XHJcbiAgICAgICAgaWYgKHMxID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FscGhhID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHRoaXMuX2xhc3RTdHJlc3MgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FscGhhID0gczE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xhc3RTdHJlc3MgPSBzMTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU5vZGVQb3NpdGlvbnMoKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoeyB0eXBlOiBFdmVudFR5cGUudGljaywgYWxwaGE6IHRoaXMuX2FscGhhLCBzdHJlc3M6IHRoaXMuX2xhc3RTdHJlc3MgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUudXBkYXRlTm9kZVBvc2l0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMuX2Rlc2NlbnQueFswXSwgeSA9IHRoaXMuX2Rlc2NlbnQueFsxXTtcclxuICAgICAgICB2YXIgbywgaSA9IHRoaXMuX25vZGVzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIG8gPSB0aGlzLl9ub2Rlc1tpXTtcclxuICAgICAgICAgICAgby54ID0geFtpXTtcclxuICAgICAgICAgICAgby55ID0geVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5ub2RlcyA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgaWYgKCF2KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9ub2Rlcy5sZW5ndGggPT09IDAgJiYgdGhpcy5fbGlua3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG4gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGlua3MuZm9yRWFjaChmdW5jdGlvbiAobCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG4gPSBNYXRoLm1heChuLCBsLnNvdXJjZSwgbC50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBBcnJheSgrK24pO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ub2Rlc1tpXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ub2RlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbm9kZXMgPSB2O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuZ3JvdXBzID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICgheClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dyb3VwcztcclxuICAgICAgICB0aGlzLl9ncm91cHMgPSB4O1xyXG4gICAgICAgIHRoaXMuX3Jvb3RHcm91cCA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2dyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZy5wYWRkaW5nID09PSBcInVuZGVmaW5lZFwiKVxyXG4gICAgICAgICAgICAgICAgZy5wYWRkaW5nID0gMTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBnLmxlYXZlcyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgZy5sZWF2ZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChnLmxlYXZlc1tpXSA9IF90aGlzLl9ub2Rlc1t2XSkucGFyZW50ID0gZztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZy5ncm91cHMgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGcuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGdpLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnaSA9PT0gJ251bWJlcicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChnLmdyb3Vwc1tpXSA9IF90aGlzLl9ncm91cHNbZ2ldKS5wYXJlbnQgPSBnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9yb290R3JvdXAubGVhdmVzID0gdGhpcy5fbm9kZXMuZmlsdGVyKGZ1bmN0aW9uICh2KSB7IHJldHVybiB0eXBlb2Ygdi5wYXJlbnQgPT09ICd1bmRlZmluZWQnOyB9KTtcclxuICAgICAgICB0aGlzLl9yb290R3JvdXAuZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLmZpbHRlcihmdW5jdGlvbiAoZykgeyByZXR1cm4gdHlwZW9mIGcucGFyZW50ID09PSAndW5kZWZpbmVkJzsgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5wb3dlckdyYXBoR3JvdXBzID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICB2YXIgZyA9IHBvd2VyZ3JhcGguZ2V0R3JvdXBzKHRoaXMuX25vZGVzLCB0aGlzLl9saW5rcywgdGhpcy5saW5rQWNjZXNzb3IsIHRoaXMuX3Jvb3RHcm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cHMoZy5ncm91cHMpO1xyXG4gICAgICAgIGYoZyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5hdm9pZE92ZXJsYXBzID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hdm9pZE92ZXJsYXBzO1xyXG4gICAgICAgIHRoaXMuX2F2b2lkT3ZlcmxhcHMgPSB2O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuaGFuZGxlRGlzY29ubmVjdGVkID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYW5kbGVEaXNjb25uZWN0ZWQ7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlRGlzY29ubmVjdGVkID0gdjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmZsb3dMYXlvdXQgPSBmdW5jdGlvbiAoYXhpcywgbWluU2VwYXJhdGlvbikge1xyXG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgYXhpcyA9ICd5JztcclxuICAgICAgICB0aGlzLl9kaXJlY3RlZExpbmtDb25zdHJhaW50cyA9IHtcclxuICAgICAgICAgICAgYXhpczogYXhpcyxcclxuICAgICAgICAgICAgZ2V0TWluU2VwYXJhdGlvbjogdHlwZW9mIG1pblNlcGFyYXRpb24gPT09ICdudW1iZXInID8gZnVuY3Rpb24gKCkgeyByZXR1cm4gbWluU2VwYXJhdGlvbjsgfSA6IG1pblNlcGFyYXRpb25cclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUubGlua3MgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmtzO1xyXG4gICAgICAgIHRoaXMuX2xpbmtzID0geDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmNvbnN0cmFpbnRzID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50cztcclxuICAgICAgICB0aGlzLl9jb25zdHJhaW50cyA9IGM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5kaXN0YW5jZU1hdHJpeCA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzdGFuY2VNYXRyaXg7XHJcbiAgICAgICAgdGhpcy5fZGlzdGFuY2VNYXRyaXggPSBkO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgaWYgKCF4KVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FudmFzU2l6ZTtcclxuICAgICAgICB0aGlzLl9jYW52YXNTaXplID0geDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmRlZmF1bHROb2RlU2l6ZSA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgaWYgKCF4KVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmYXVsdE5vZGVTaXplO1xyXG4gICAgICAgIHRoaXMuX2RlZmF1bHROb2RlU2l6ZSA9IHg7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5ncm91cENvbXBhY3RuZXNzID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoIXgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ncm91cENvbXBhY3RuZXNzO1xyXG4gICAgICAgIHRoaXMuX2dyb3VwQ29tcGFjdG5lc3MgPSB4O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUubGlua0Rpc3RhbmNlID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoIXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmtEaXN0YW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGlua0Rpc3RhbmNlID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiAreDtcclxuICAgICAgICB0aGlzLl9saW5rTGVuZ3RoQ2FsY3VsYXRvciA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5saW5rVHlwZSA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgdGhpcy5fbGlua1R5cGUgPSBmO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuY29udmVyZ2VuY2VUaHJlc2hvbGQgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGlmICgheClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RocmVzaG9sZDtcclxuICAgICAgICB0aGlzLl90aHJlc2hvbGQgPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6ICt4O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuYWxwaGEgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FscGhhO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB4ID0gK3g7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9hbHBoYSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FscGhhID0geDtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hbHBoYSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoeCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fcnVubmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3J1bm5pbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcih7IHR5cGU6IEV2ZW50VHlwZS5zdGFydCwgYWxwaGE6IHRoaXMuX2FscGhhID0geCB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtpY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5nZXRMaW5rTGVuZ3RoID0gZnVuY3Rpb24gKGxpbmspIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuX2xpbmtEaXN0YW5jZSA9PT0gXCJmdW5jdGlvblwiID8gKyh0aGlzLl9saW5rRGlzdGFuY2UobGluaykpIDogdGhpcy5fbGlua0Rpc3RhbmNlO1xyXG4gICAgfTtcclxuICAgIExheW91dC5zZXRMaW5rTGVuZ3RoID0gZnVuY3Rpb24gKGxpbmssIGxlbmd0aCkge1xyXG4gICAgICAgIGxpbmsubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuZ2V0TGlua1R5cGUgPSBmdW5jdGlvbiAobGluaykge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5fbGlua1R5cGUgPT09IFwiZnVuY3Rpb25cIiA/IHRoaXMuX2xpbmtUeXBlKGxpbmspIDogMDtcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3RocyA9IGZ1bmN0aW9uIChpZGVhbExlbmd0aCwgdykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHcgPT09IHZvaWQgMCkgeyB3ID0gMTsgfVxyXG4gICAgICAgIHRoaXMubGlua0Rpc3RhbmNlKGZ1bmN0aW9uIChsKSB7IHJldHVybiBpZGVhbExlbmd0aCAqIGwubGVuZ3RoOyB9KTtcclxuICAgICAgICB0aGlzLl9saW5rTGVuZ3RoQ2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGxpbmtsZW5ndGhzXzEuc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzKF90aGlzLl9saW5rcywgX3RoaXMubGlua0FjY2Vzc29yLCB3KTsgfTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmphY2NhcmRMaW5rTGVuZ3RocyA9IGZ1bmN0aW9uIChpZGVhbExlbmd0aCwgdykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHcgPT09IHZvaWQgMCkgeyB3ID0gMTsgfVxyXG4gICAgICAgIHRoaXMubGlua0Rpc3RhbmNlKGZ1bmN0aW9uIChsKSB7IHJldHVybiBpZGVhbExlbmd0aCAqIGwubGVuZ3RoOyB9KTtcclxuICAgICAgICB0aGlzLl9saW5rTGVuZ3RoQ2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGxpbmtsZW5ndGhzXzEuamFjY2FyZExpbmtMZW5ndGhzKF90aGlzLl9saW5rcywgX3RoaXMubGlua0FjY2Vzc29yLCB3KTsgfTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKGluaXRpYWxVbmNvbnN0cmFpbmVkSXRlcmF0aW9ucywgaW5pdGlhbFVzZXJDb25zdHJhaW50SXRlcmF0aW9ucywgaW5pdGlhbEFsbENvbnN0cmFpbnRzSXRlcmF0aW9ucywgZ3JpZFNuYXBJdGVyYXRpb25zLCBrZWVwUnVubmluZykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGluaXRpYWxVbmNvbnN0cmFpbmVkSXRlcmF0aW9ucyA9PT0gdm9pZCAwKSB7IGluaXRpYWxVbmNvbnN0cmFpbmVkSXRlcmF0aW9ucyA9IDA7IH1cclxuICAgICAgICBpZiAoaW5pdGlhbFVzZXJDb25zdHJhaW50SXRlcmF0aW9ucyA9PT0gdm9pZCAwKSB7IGluaXRpYWxVc2VyQ29uc3RyYWludEl0ZXJhdGlvbnMgPSAwOyB9XHJcbiAgICAgICAgaWYgKGluaXRpYWxBbGxDb25zdHJhaW50c0l0ZXJhdGlvbnMgPT09IHZvaWQgMCkgeyBpbml0aWFsQWxsQ29uc3RyYWludHNJdGVyYXRpb25zID0gMDsgfVxyXG4gICAgICAgIGlmIChncmlkU25hcEl0ZXJhdGlvbnMgPT09IHZvaWQgMCkgeyBncmlkU25hcEl0ZXJhdGlvbnMgPSAwOyB9XHJcbiAgICAgICAgaWYgKGtlZXBSdW5uaW5nID09PSB2b2lkIDApIHsga2VlcFJ1bm5pbmcgPSB0cnVlOyB9XHJcbiAgICAgICAgdmFyIGksIGosIG4gPSB0aGlzLm5vZGVzKCkubGVuZ3RoLCBOID0gbiArIDIgKiB0aGlzLl9ncm91cHMubGVuZ3RoLCBtID0gdGhpcy5fbGlua3MubGVuZ3RoLCB3ID0gdGhpcy5fY2FudmFzU2l6ZVswXSwgaCA9IHRoaXMuX2NhbnZhc1NpemVbMV07XHJcbiAgICAgICAgdmFyIHggPSBuZXcgQXJyYXkoTiksIHkgPSBuZXcgQXJyYXkoTik7XHJcbiAgICAgICAgdmFyIEcgPSBudWxsO1xyXG4gICAgICAgIHZhciBhbyA9IHRoaXMuX2F2b2lkT3ZlcmxhcHM7XHJcbiAgICAgICAgdGhpcy5fbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICB2LmluZGV4ID0gaTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2LnggPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICB2LnggPSB3IC8gMiwgdi55ID0gaCAvIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeFtpXSA9IHYueCwgeVtpXSA9IHYueTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodGhpcy5fbGlua0xlbmd0aENhbGN1bGF0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuX2xpbmtMZW5ndGhDYWxjdWxhdG9yKCk7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlcztcclxuICAgICAgICBpZiAodGhpcy5fZGlzdGFuY2VNYXRyaXgpIHtcclxuICAgICAgICAgICAgZGlzdGFuY2VzID0gdGhpcy5fZGlzdGFuY2VNYXRyaXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkaXN0YW5jZXMgPSAobmV3IHNob3J0ZXN0cGF0aHNfMS5DYWxjdWxhdG9yKE4sIHRoaXMuX2xpbmtzLCBMYXlvdXQuZ2V0U291cmNlSW5kZXgsIExheW91dC5nZXRUYXJnZXRJbmRleCwgZnVuY3Rpb24gKGwpIHsgcmV0dXJuIF90aGlzLmdldExpbmtMZW5ndGgobCk7IH0pKS5EaXN0YW5jZU1hdHJpeCgpO1xyXG4gICAgICAgICAgICBHID0gZGVzY2VudF8xLkRlc2NlbnQuY3JlYXRlU3F1YXJlTWF0cml4KE4sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIDI7IH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGwuc291cmNlID09IFwibnVtYmVyXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgbC5zb3VyY2UgPSBfdGhpcy5fbm9kZXNbbC5zb3VyY2VdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsLnRhcmdldCA9PSBcIm51bWJlclwiKVxyXG4gICAgICAgICAgICAgICAgICAgIGwudGFyZ2V0ID0gX3RoaXMuX25vZGVzW2wudGFyZ2V0XTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2xpbmtzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB1ID0gTGF5b3V0LmdldFNvdXJjZUluZGV4KGUpLCB2ID0gTGF5b3V0LmdldFRhcmdldEluZGV4KGUpO1xyXG4gICAgICAgICAgICAgICAgR1t1XVt2XSA9IEdbdl1bdV0gPSBlLndlaWdodCB8fCAxO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIEQgPSBkZXNjZW50XzEuRGVzY2VudC5jcmVhdGVTcXVhcmVNYXRyaXgoTiwgZnVuY3Rpb24gKGksIGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRpc3RhbmNlc1tpXVtqXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodGhpcy5fcm9vdEdyb3VwICYmIHR5cGVvZiB0aGlzLl9yb290R3JvdXAuZ3JvdXBzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB2YXIgaSA9IG47XHJcbiAgICAgICAgICAgIHZhciBhZGRBdHRyYWN0aW9uID0gZnVuY3Rpb24gKGksIGosIHN0cmVuZ3RoLCBpZGVhbERpc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBHW2ldW2pdID0gR1tqXVtpXSA9IHN0cmVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgRFtpXVtqXSA9IERbal1baV0gPSBpZGVhbERpc3RhbmNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLl9ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICAgICAgYWRkQXR0cmFjdGlvbihpLCBpICsgMSwgX3RoaXMuX2dyb3VwQ29tcGFjdG5lc3MsIDAuMSk7XHJcbiAgICAgICAgICAgICAgICB4W2ldID0gMCwgeVtpKytdID0gMDtcclxuICAgICAgICAgICAgICAgIHhbaV0gPSAwLCB5W2krK10gPSAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLl9yb290R3JvdXAgPSB7IGxlYXZlczogdGhpcy5fbm9kZXMsIGdyb3VwczogW10gfTtcclxuICAgICAgICB2YXIgY3VyQ29uc3RyYWludHMgPSB0aGlzLl9jb25zdHJhaW50cyB8fCBbXTtcclxuICAgICAgICBpZiAodGhpcy5fZGlyZWN0ZWRMaW5rQ29uc3RyYWludHMpIHtcclxuICAgICAgICAgICAgdGhpcy5saW5rQWNjZXNzb3IuZ2V0TWluU2VwYXJhdGlvbiA9IHRoaXMuX2RpcmVjdGVkTGlua0NvbnN0cmFpbnRzLmdldE1pblNlcGFyYXRpb247XHJcbiAgICAgICAgICAgIGN1ckNvbnN0cmFpbnRzID0gY3VyQ29uc3RyYWludHMuY29uY2F0KGxpbmtsZW5ndGhzXzEuZ2VuZXJhdGVEaXJlY3RlZEVkZ2VDb25zdHJhaW50cyhuLCB0aGlzLl9saW5rcywgdGhpcy5fZGlyZWN0ZWRMaW5rQ29uc3RyYWludHMuYXhpcywgKHRoaXMubGlua0FjY2Vzc29yKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmF2b2lkT3ZlcmxhcHMoZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQgPSBuZXcgZGVzY2VudF8xLkRlc2NlbnQoW3gsIHldLCBEKTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50LmxvY2tzLmNsZWFyKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIG8gPSB0aGlzLl9ub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKG8uZml4ZWQpIHtcclxuICAgICAgICAgICAgICAgIG8ucHggPSBvLng7XHJcbiAgICAgICAgICAgICAgICBvLnB5ID0gby55O1xyXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBbby54LCBvLnldO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5sb2Nrcy5hZGQoaSwgcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudC50aHJlc2hvbGQgPSB0aGlzLl90aHJlc2hvbGQ7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsTGF5b3V0KGluaXRpYWxVbmNvbnN0cmFpbmVkSXRlcmF0aW9ucywgeCwgeSk7XHJcbiAgICAgICAgaWYgKGN1ckNvbnN0cmFpbnRzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQucHJvamVjdCA9IG5ldyByZWN0YW5nbGVfMS5Qcm9qZWN0aW9uKHRoaXMuX25vZGVzLCB0aGlzLl9ncm91cHMsIHRoaXMuX3Jvb3RHcm91cCwgY3VyQ29uc3RyYWludHMpLnByb2plY3RGdW5jdGlvbnMoKTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50LnJ1bihpbml0aWFsVXNlckNvbnN0cmFpbnRJdGVyYXRpb25zKTtcclxuICAgICAgICB0aGlzLnNlcGFyYXRlT3ZlcmxhcHBpbmdDb21wb25lbnRzKHcsIGgpO1xyXG4gICAgICAgIHRoaXMuYXZvaWRPdmVybGFwcyhhbyk7XHJcbiAgICAgICAgaWYgKGFvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgdi54ID0geFtpXSwgdi55ID0geVtpXTsgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQucHJvamVjdCA9IG5ldyByZWN0YW5nbGVfMS5Qcm9qZWN0aW9uKHRoaXMuX25vZGVzLCB0aGlzLl9ncm91cHMsIHRoaXMuX3Jvb3RHcm91cCwgY3VyQ29uc3RyYWludHMsIHRydWUpLnByb2plY3RGdW5jdGlvbnMoKTtcclxuICAgICAgICAgICAgdGhpcy5fbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkgeyB4W2ldID0gdi54LCB5W2ldID0gdi55OyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudC5HID0gRztcclxuICAgICAgICB0aGlzLl9kZXNjZW50LnJ1bihpbml0aWFsQWxsQ29uc3RyYWludHNJdGVyYXRpb25zKTtcclxuICAgICAgICBpZiAoZ3JpZFNuYXBJdGVyYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQuc25hcFN0cmVuZ3RoID0gMTAwMDtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5zbmFwR3JpZFNpemUgPSB0aGlzLl9ub2Rlc1swXS53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5udW1HcmlkU25hcE5vZGVzID0gbjtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5zY2FsZVNuYXBCeU1heEggPSBuICE9IE47XHJcbiAgICAgICAgICAgIHZhciBHMCA9IGRlc2NlbnRfMS5EZXNjZW50LmNyZWF0ZVNxdWFyZU1hdHJpeChOLCBmdW5jdGlvbiAoaSwgaikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPj0gbiB8fCBqID49IG4pXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEdbaV1bal07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQuRyA9IEcwO1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LnJ1bihncmlkU25hcEl0ZXJhdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZU5vZGVQb3NpdGlvbnMoKTtcclxuICAgICAgICB0aGlzLnNlcGFyYXRlT3ZlcmxhcHBpbmdDb21wb25lbnRzKHcsIGgpO1xyXG4gICAgICAgIHJldHVybiBrZWVwUnVubmluZyA/IHRoaXMucmVzdW1lKCkgOiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuaW5pdGlhbExheW91dCA9IGZ1bmN0aW9uIChpdGVyYXRpb25zLCB4LCB5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2dyb3Vwcy5sZW5ndGggPiAwICYmIGl0ZXJhdGlvbnMgPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBuID0gdGhpcy5fbm9kZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgZWRnZXMgPSB0aGlzLl9saW5rcy5tYXAoZnVuY3Rpb24gKGUpIHsgcmV0dXJuICh7IHNvdXJjZTogZS5zb3VyY2UuaW5kZXgsIHRhcmdldDogZS50YXJnZXQuaW5kZXggfSk7IH0pO1xyXG4gICAgICAgICAgICB2YXIgdnMgPSB0aGlzLl9ub2Rlcy5tYXAoZnVuY3Rpb24gKHYpIHsgcmV0dXJuICh7IGluZGV4OiB2LmluZGV4IH0pOyB9KTtcclxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcsIGkpIHtcclxuICAgICAgICAgICAgICAgIHZzLnB1c2goeyBpbmRleDogZy5pbmRleCA9IG4gKyBpIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcsIGkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZy5sZWF2ZXMgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICAgICAgICAgIGcubGVhdmVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGVkZ2VzLnB1c2goeyBzb3VyY2U6IGcuaW5kZXgsIHRhcmdldDogdi5pbmRleCB9KTsgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGcuZ3JvdXBzICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgICAgICAgICBnLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnZykgeyByZXR1cm4gZWRnZXMucHVzaCh7IHNvdXJjZTogZy5pbmRleCwgdGFyZ2V0OiBnZy5pbmRleCB9KTsgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBuZXcgTGF5b3V0KClcclxuICAgICAgICAgICAgICAgIC5zaXplKHRoaXMuc2l6ZSgpKVxyXG4gICAgICAgICAgICAgICAgLm5vZGVzKHZzKVxyXG4gICAgICAgICAgICAgICAgLmxpbmtzKGVkZ2VzKVxyXG4gICAgICAgICAgICAgICAgLmF2b2lkT3ZlcmxhcHMoZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAubGlua0Rpc3RhbmNlKHRoaXMubGlua0Rpc3RhbmNlKCkpXHJcbiAgICAgICAgICAgICAgICAuc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzKDUpXHJcbiAgICAgICAgICAgICAgICAuY29udmVyZ2VuY2VUaHJlc2hvbGQoMWUtNClcclxuICAgICAgICAgICAgICAgIC5zdGFydChpdGVyYXRpb25zLCAwLCAwLCAwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIHhbdi5pbmRleF0gPSB2c1t2LmluZGV4XS54O1xyXG4gICAgICAgICAgICAgICAgeVt2LmluZGV4XSA9IHZzW3YuaW5kZXhdLnk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5ydW4oaXRlcmF0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuc2VwYXJhdGVPdmVybGFwcGluZ0NvbXBvbmVudHMgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kaXN0YW5jZU1hdHJpeCAmJiB0aGlzLl9oYW5kbGVEaXNjb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgdmFyIHhfMSA9IHRoaXMuX2Rlc2NlbnQueFswXSwgeV8xID0gdGhpcy5fZGVzY2VudC54WzFdO1xyXG4gICAgICAgICAgICB0aGlzLl9ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHYueCA9IHhfMVtpXSwgdi55ID0geV8xW2ldOyB9KTtcclxuICAgICAgICAgICAgdmFyIGdyYXBocyA9IGhhbmRsZWRpc2Nvbm5lY3RlZF8xLnNlcGFyYXRlR3JhcGhzKHRoaXMuX25vZGVzLCB0aGlzLl9saW5rcyk7XHJcbiAgICAgICAgICAgIGhhbmRsZWRpc2Nvbm5lY3RlZF8xLmFwcGx5UGFja2luZyhncmFwaHMsIHdpZHRoLCBoZWlnaHQsIHRoaXMuX2RlZmF1bHROb2RlU2l6ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLl9kZXNjZW50LnhbMF1baV0gPSB2LngsIF90aGlzLl9kZXNjZW50LnhbMV1baV0gPSB2Lnk7XHJcbiAgICAgICAgICAgICAgICBpZiAodi5ib3VuZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LmJvdW5kcy5zZXRYQ2VudHJlKHYueCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5ib3VuZHMuc2V0WUNlbnRyZSh2LnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEoMC4xKTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEoMCk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5wcmVwYXJlRWRnZVJvdXRpbmcgPSBmdW5jdGlvbiAobm9kZU1hcmdpbikge1xyXG4gICAgICAgIGlmIChub2RlTWFyZ2luID09PSB2b2lkIDApIHsgbm9kZU1hcmdpbiA9IDA7IH1cclxuICAgICAgICB0aGlzLl92aXNpYmlsaXR5R3JhcGggPSBuZXcgZ2VvbV8xLlRhbmdlbnRWaXNpYmlsaXR5R3JhcGgodGhpcy5fbm9kZXMubWFwKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2LmJvdW5kcy5pbmZsYXRlKC1ub2RlTWFyZ2luKS52ZXJ0aWNlcygpO1xyXG4gICAgICAgIH0pKTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnJvdXRlRWRnZSA9IGZ1bmN0aW9uIChlZGdlLCBkcmF3KSB7XHJcbiAgICAgICAgdmFyIGxpbmVEYXRhID0gW107XHJcbiAgICAgICAgdmFyIHZnMiA9IG5ldyBnZW9tXzEuVGFuZ2VudFZpc2liaWxpdHlHcmFwaCh0aGlzLl92aXNpYmlsaXR5R3JhcGguUCwgeyBWOiB0aGlzLl92aXNpYmlsaXR5R3JhcGguViwgRTogdGhpcy5fdmlzaWJpbGl0eUdyYXBoLkUgfSksIHBvcnQxID0geyB4OiBlZGdlLnNvdXJjZS54LCB5OiBlZGdlLnNvdXJjZS55IH0sIHBvcnQyID0geyB4OiBlZGdlLnRhcmdldC54LCB5OiBlZGdlLnRhcmdldC55IH0sIHN0YXJ0ID0gdmcyLmFkZFBvaW50KHBvcnQxLCBlZGdlLnNvdXJjZS5pbmRleCksIGVuZCA9IHZnMi5hZGRQb2ludChwb3J0MiwgZWRnZS50YXJnZXQuaW5kZXgpO1xyXG4gICAgICAgIHZnMi5hZGRFZGdlSWZWaXNpYmxlKHBvcnQxLCBwb3J0MiwgZWRnZS5zb3VyY2UuaW5kZXgsIGVkZ2UudGFyZ2V0LmluZGV4KTtcclxuICAgICAgICBpZiAodHlwZW9mIGRyYXcgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGRyYXcodmcyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNvdXJjZUluZCA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZS5pZDsgfSwgdGFyZ2V0SW5kID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0LmlkOyB9LCBsZW5ndGggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGgoKTsgfSwgc3BDYWxjID0gbmV3IHNob3J0ZXN0cGF0aHNfMS5DYWxjdWxhdG9yKHZnMi5WLmxlbmd0aCwgdmcyLkUsIHNvdXJjZUluZCwgdGFyZ2V0SW5kLCBsZW5ndGgpLCBzaG9ydGVzdFBhdGggPSBzcENhbGMuUGF0aEZyb21Ob2RlVG9Ob2RlKHN0YXJ0LmlkLCBlbmQuaWQpO1xyXG4gICAgICAgIGlmIChzaG9ydGVzdFBhdGgubGVuZ3RoID09PSAxIHx8IHNob3J0ZXN0UGF0aC5sZW5ndGggPT09IHZnMi5WLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgcm91dGUgPSByZWN0YW5nbGVfMS5tYWtlRWRnZUJldHdlZW4oZWRnZS5zb3VyY2UuaW5uZXJCb3VuZHMsIGVkZ2UudGFyZ2V0LmlubmVyQm91bmRzLCA1KTtcclxuICAgICAgICAgICAgbGluZURhdGEgPSBbcm91dGUuc291cmNlSW50ZXJzZWN0aW9uLCByb3V0ZS5hcnJvd1N0YXJ0XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBuID0gc2hvcnRlc3RQYXRoLmxlbmd0aCAtIDIsIHAgPSB2ZzIuVltzaG9ydGVzdFBhdGhbbl1dLnAsIHEgPSB2ZzIuVltzaG9ydGVzdFBhdGhbMF1dLnAsIGxpbmVEYXRhID0gW2VkZ2Uuc291cmNlLmlubmVyQm91bmRzLnJheUludGVyc2VjdGlvbihwLngsIHAueSldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gbjsgaSA+PSAwOyAtLWkpXHJcbiAgICAgICAgICAgICAgICBsaW5lRGF0YS5wdXNoKHZnMi5WW3Nob3J0ZXN0UGF0aFtpXV0ucCk7XHJcbiAgICAgICAgICAgIGxpbmVEYXRhLnB1c2gocmVjdGFuZ2xlXzEubWFrZUVkZ2VUbyhxLCBlZGdlLnRhcmdldC5pbm5lckJvdW5kcywgNSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGluZURhdGE7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LmdldFNvdXJjZUluZGV4ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIGUuc291cmNlID09PSAnbnVtYmVyJyA/IGUuc291cmNlIDogZS5zb3VyY2UuaW5kZXg7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LmdldFRhcmdldEluZGV4ID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIGUudGFyZ2V0ID09PSAnbnVtYmVyJyA/IGUudGFyZ2V0IDogZS50YXJnZXQuaW5kZXg7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LmxpbmtJZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIExheW91dC5nZXRTb3VyY2VJbmRleChlKSArIFwiLVwiICsgTGF5b3V0LmdldFRhcmdldEluZGV4KGUpO1xyXG4gICAgfTtcclxuICAgIExheW91dC5kcmFnU3RhcnQgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmIChpc0dyb3VwKGQpKSB7XHJcbiAgICAgICAgICAgIExheW91dC5zdG9yZU9mZnNldChkLCBMYXlvdXQuZHJhZ09yaWdpbihkKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBMYXlvdXQuc3RvcE5vZGUoZCk7XHJcbiAgICAgICAgICAgIGQuZml4ZWQgfD0gMjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnN0b3BOb2RlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2LnB4ID0gdi54O1xyXG4gICAgICAgIHYucHkgPSB2Lnk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnN0b3JlT2Zmc2V0ID0gZnVuY3Rpb24gKGQsIG9yaWdpbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZC5sZWF2ZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGQubGVhdmVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIHYuZml4ZWQgfD0gMjtcclxuICAgICAgICAgICAgICAgIExheW91dC5zdG9wTm9kZSh2KTtcclxuICAgICAgICAgICAgICAgIHYuX2RyYWdHcm91cE9mZnNldFggPSB2LnggLSBvcmlnaW4ueDtcclxuICAgICAgICAgICAgICAgIHYuX2RyYWdHcm91cE9mZnNldFkgPSB2LnkgLSBvcmlnaW4ueTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZC5ncm91cHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGQuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHsgcmV0dXJuIExheW91dC5zdG9yZU9mZnNldChnLCBvcmlnaW4pOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LmRyYWdPcmlnaW4gPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmIChpc0dyb3VwKGQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB4OiBkLmJvdW5kcy5jeCgpLFxyXG4gICAgICAgICAgICAgICAgeTogZC5ib3VuZHMuY3koKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5kcmFnID0gZnVuY3Rpb24gKGQsIHBvc2l0aW9uKSB7XHJcbiAgICAgICAgaWYgKGlzR3JvdXAoZCkpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGQubGVhdmVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgICAgICBkLmJvdW5kcy5zZXRYQ2VudHJlKHBvc2l0aW9uLngpO1xyXG4gICAgICAgICAgICAgICAgICAgIGQuYm91bmRzLnNldFlDZW50cmUocG9zaXRpb24ueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5weCA9IHYuX2RyYWdHcm91cE9mZnNldFggKyBwb3NpdGlvbi54O1xyXG4gICAgICAgICAgICAgICAgICAgIHYucHkgPSB2Ll9kcmFnR3JvdXBPZmZzZXRZICsgcG9zaXRpb24ueTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZC5ncm91cHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBkLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7IHJldHVybiBMYXlvdXQuZHJhZyhnLCBwb3NpdGlvbik7IH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkLnB4ID0gcG9zaXRpb24ueDtcclxuICAgICAgICAgICAgZC5weSA9IHBvc2l0aW9uLnk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5kcmFnRW5kID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBpZiAoaXNHcm91cChkKSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGQubGVhdmVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZC5sZWF2ZXMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgICAgIExheW91dC5kcmFnRW5kKHYpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2Ll9kcmFnR3JvdXBPZmZzZXRYO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2Ll9kcmFnR3JvdXBPZmZzZXRZO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGQuZ3JvdXBzLmZvckVhY2goTGF5b3V0LmRyYWdFbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkLmZpeGVkICY9IH42O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQubW91c2VPdmVyID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBkLmZpeGVkIHw9IDQ7XHJcbiAgICAgICAgZC5weCA9IGQueCwgZC5weSA9IGQueTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQubW91c2VPdXQgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGQuZml4ZWQgJj0gfjQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIExheW91dDtcclxufSgpKTtcclxuZXhwb3J0cy5MYXlvdXQgPSBMYXlvdXQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxheW91dC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgc2hvcnRlc3RwYXRoc18xID0gcmVxdWlyZShcIi4vc2hvcnRlc3RwYXRoc1wiKTtcclxudmFyIGRlc2NlbnRfMSA9IHJlcXVpcmUoXCIuL2Rlc2NlbnRcIik7XHJcbnZhciByZWN0YW5nbGVfMSA9IHJlcXVpcmUoXCIuL3JlY3RhbmdsZVwiKTtcclxudmFyIGxpbmtsZW5ndGhzXzEgPSByZXF1aXJlKFwiLi9saW5rbGVuZ3Roc1wiKTtcclxudmFyIExpbmszRCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMaW5rM0Qoc291cmNlLCB0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgIH1cclxuICAgIExpbmszRC5wcm90b3R5cGUuYWN0dWFsTGVuZ3RoID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoeC5yZWR1Y2UoZnVuY3Rpb24gKGMsIHYpIHtcclxuICAgICAgICAgICAgdmFyIGR4ID0gdltfdGhpcy50YXJnZXRdIC0gdltfdGhpcy5zb3VyY2VdO1xyXG4gICAgICAgICAgICByZXR1cm4gYyArIGR4ICogZHg7XHJcbiAgICAgICAgfSwgMCkpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBMaW5rM0Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTGluazNEID0gTGluazNEO1xyXG52YXIgTm9kZTNEID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5vZGUzRCh4LCB5LCB6KSB7XHJcbiAgICAgICAgaWYgKHggPT09IHZvaWQgMCkgeyB4ID0gMDsgfVxyXG4gICAgICAgIGlmICh5ID09PSB2b2lkIDApIHsgeSA9IDA7IH1cclxuICAgICAgICBpZiAoeiA9PT0gdm9pZCAwKSB7IHogPSAwOyB9XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMueiA9IHo7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTm9kZTNEO1xyXG59KCkpO1xyXG5leHBvcnRzLk5vZGUzRCA9IE5vZGUzRDtcclxudmFyIExheW91dDNEID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExheW91dDNEKG5vZGVzLCBsaW5rcywgaWRlYWxMaW5rTGVuZ3RoKSB7XHJcbiAgICAgICAgaWYgKGlkZWFsTGlua0xlbmd0aCA9PT0gdm9pZCAwKSB7IGlkZWFsTGlua0xlbmd0aCA9IDE7IH1cclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgICAgICB0aGlzLmxpbmtzID0gbGlua3M7XHJcbiAgICAgICAgdGhpcy5pZGVhbExpbmtMZW5ndGggPSBpZGVhbExpbmtMZW5ndGg7XHJcbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy51c2VKYWNjYXJkTGlua0xlbmd0aHMgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucmVzdWx0ID0gbmV3IEFycmF5KExheW91dDNELmspO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTGF5b3V0M0QuazsgKytpKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzdWx0W2ldID0gbmV3IEFycmF5KG5vZGVzLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IExheW91dDNELmRpbXM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGltID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2W2RpbV0gPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgdltkaW1dID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfdGhpcy5yZXN1bHRbMF1baV0gPSB2Lng7XHJcbiAgICAgICAgICAgIF90aGlzLnJlc3VsdFsxXVtpXSA9IHYueTtcclxuICAgICAgICAgICAgX3RoaXMucmVzdWx0WzJdW2ldID0gdi56O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgO1xyXG4gICAgTGF5b3V0M0QucHJvdG90eXBlLmxpbmtMZW5ndGggPSBmdW5jdGlvbiAobCkge1xyXG4gICAgICAgIHJldHVybiBsLmFjdHVhbExlbmd0aCh0aGlzLnJlc3VsdCk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0M0QucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKGl0ZXJhdGlvbnMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmIChpdGVyYXRpb25zID09PSB2b2lkIDApIHsgaXRlcmF0aW9ucyA9IDEwMDsgfVxyXG4gICAgICAgIHZhciBuID0gdGhpcy5ub2Rlcy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGxpbmtBY2Nlc3NvciA9IG5ldyBMaW5rQWNjZXNzb3IoKTtcclxuICAgICAgICBpZiAodGhpcy51c2VKYWNjYXJkTGlua0xlbmd0aHMpXHJcbiAgICAgICAgICAgIGxpbmtsZW5ndGhzXzEuamFjY2FyZExpbmtMZW5ndGhzKHRoaXMubGlua3MsIGxpbmtBY2Nlc3NvciwgMS41KTtcclxuICAgICAgICB0aGlzLmxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUubGVuZ3RoICo9IF90aGlzLmlkZWFsTGlua0xlbmd0aDsgfSk7XHJcbiAgICAgICAgdmFyIGRpc3RhbmNlTWF0cml4ID0gKG5ldyBzaG9ydGVzdHBhdGhzXzEuQ2FsY3VsYXRvcihuLCB0aGlzLmxpbmtzLCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5zb3VyY2U7IH0sIGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnRhcmdldDsgfSwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUubGVuZ3RoOyB9KSkuRGlzdGFuY2VNYXRyaXgoKTtcclxuICAgICAgICB2YXIgRCA9IGRlc2NlbnRfMS5EZXNjZW50LmNyZWF0ZVNxdWFyZU1hdHJpeChuLCBmdW5jdGlvbiAoaSwgaikgeyByZXR1cm4gZGlzdGFuY2VNYXRyaXhbaV1bal07IH0pO1xyXG4gICAgICAgIHZhciBHID0gZGVzY2VudF8xLkRlc2NlbnQuY3JlYXRlU3F1YXJlTWF0cml4KG4sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIDI7IH0pO1xyXG4gICAgICAgIHRoaXMubGlua3MuZm9yRWFjaChmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IF9hLnNvdXJjZSwgdGFyZ2V0ID0gX2EudGFyZ2V0O1xyXG4gICAgICAgICAgICByZXR1cm4gR1tzb3VyY2VdW3RhcmdldF0gPSBHW3RhcmdldF1bc291cmNlXSA9IDE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kZXNjZW50ID0gbmV3IGRlc2NlbnRfMS5EZXNjZW50KHRoaXMucmVzdWx0LCBEKTtcclxuICAgICAgICB0aGlzLmRlc2NlbnQudGhyZXNob2xkID0gMWUtMztcclxuICAgICAgICB0aGlzLmRlc2NlbnQuRyA9IEc7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uc3RyYWludHMpXHJcbiAgICAgICAgICAgIHRoaXMuZGVzY2VudC5wcm9qZWN0ID0gbmV3IHJlY3RhbmdsZV8xLlByb2plY3Rpb24odGhpcy5ub2RlcywgbnVsbCwgbnVsbCwgdGhpcy5jb25zdHJhaW50cykucHJvamVjdEZ1bmN0aW9ucygpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdiA9IHRoaXMubm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh2LmZpeGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2NlbnQubG9ja3MuYWRkKGksIFt2LngsIHYueSwgdi56XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZXNjZW50LnJ1bihpdGVyYXRpb25zKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQzRC5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmRlc2NlbnQubG9ja3MuY2xlYXIoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHYgPSB0aGlzLm5vZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAodi5maXhlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNjZW50LmxvY2tzLmFkZChpLCBbdi54LCB2LnksIHYuel0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmRlc2NlbnQucnVuZ2VLdXR0YSgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBMYXlvdXQzRDtcclxufSgpKTtcclxuTGF5b3V0M0QuZGltcyA9IFsneCcsICd5JywgJ3onXTtcclxuTGF5b3V0M0QuayA9IExheW91dDNELmRpbXMubGVuZ3RoO1xyXG5leHBvcnRzLkxheW91dDNEID0gTGF5b3V0M0Q7XHJcbnZhciBMaW5rQWNjZXNzb3IgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTGlua0FjY2Vzc29yKCkge1xyXG4gICAgfVxyXG4gICAgTGlua0FjY2Vzc29yLnByb3RvdHlwZS5nZXRTb3VyY2VJbmRleCA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZTsgfTtcclxuICAgIExpbmtBY2Nlc3Nvci5wcm90b3R5cGUuZ2V0VGFyZ2V0SW5kZXggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS50YXJnZXQ7IH07XHJcbiAgICBMaW5rQWNjZXNzb3IucHJvdG90eXBlLmdldExlbmd0aCA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLmxlbmd0aDsgfTtcclxuICAgIExpbmtBY2Nlc3Nvci5wcm90b3R5cGUuc2V0TGVuZ3RoID0gZnVuY3Rpb24gKGUsIGwpIHsgZS5sZW5ndGggPSBsOyB9O1xyXG4gICAgcmV0dXJuIExpbmtBY2Nlc3NvcjtcclxufSgpKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGF5b3V0M2QuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZnVuY3Rpb24gdW5pb25Db3VudChhLCBiKSB7XHJcbiAgICB2YXIgdSA9IHt9O1xyXG4gICAgZm9yICh2YXIgaSBpbiBhKVxyXG4gICAgICAgIHVbaV0gPSB7fTtcclxuICAgIGZvciAodmFyIGkgaW4gYilcclxuICAgICAgICB1W2ldID0ge307XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModSkubGVuZ3RoO1xyXG59XHJcbmZ1bmN0aW9uIGludGVyc2VjdGlvbkNvdW50KGEsIGIpIHtcclxuICAgIHZhciBuID0gMDtcclxuICAgIGZvciAodmFyIGkgaW4gYSlcclxuICAgICAgICBpZiAodHlwZW9mIGJbaV0gIT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICArK247XHJcbiAgICByZXR1cm4gbjtcclxufVxyXG5mdW5jdGlvbiBnZXROZWlnaGJvdXJzKGxpbmtzLCBsYSkge1xyXG4gICAgdmFyIG5laWdoYm91cnMgPSB7fTtcclxuICAgIHZhciBhZGROZWlnaGJvdXJzID0gZnVuY3Rpb24gKHUsIHYpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG5laWdoYm91cnNbdV0gPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICBuZWlnaGJvdXJzW3VdID0ge307XHJcbiAgICAgICAgbmVpZ2hib3Vyc1t1XVt2XSA9IHt9O1xyXG4gICAgfTtcclxuICAgIGxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICB2YXIgdSA9IGxhLmdldFNvdXJjZUluZGV4KGUpLCB2ID0gbGEuZ2V0VGFyZ2V0SW5kZXgoZSk7XHJcbiAgICAgICAgYWRkTmVpZ2hib3Vycyh1LCB2KTtcclxuICAgICAgICBhZGROZWlnaGJvdXJzKHYsIHUpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmVpZ2hib3VycztcclxufVxyXG5mdW5jdGlvbiBjb21wdXRlTGlua0xlbmd0aHMobGlua3MsIHcsIGYsIGxhKSB7XHJcbiAgICB2YXIgbmVpZ2hib3VycyA9IGdldE5laWdoYm91cnMobGlua3MsIGxhKTtcclxuICAgIGxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGwpIHtcclxuICAgICAgICB2YXIgYSA9IG5laWdoYm91cnNbbGEuZ2V0U291cmNlSW5kZXgobCldO1xyXG4gICAgICAgIHZhciBiID0gbmVpZ2hib3Vyc1tsYS5nZXRUYXJnZXRJbmRleChsKV07XHJcbiAgICAgICAgbGEuc2V0TGVuZ3RoKGwsIDEgKyB3ICogZihhLCBiKSk7XHJcbiAgICB9KTtcclxufVxyXG5mdW5jdGlvbiBzeW1tZXRyaWNEaWZmTGlua0xlbmd0aHMobGlua3MsIGxhLCB3KSB7XHJcbiAgICBpZiAodyA9PT0gdm9pZCAwKSB7IHcgPSAxOyB9XHJcbiAgICBjb21wdXRlTGlua0xlbmd0aHMobGlua3MsIHcsIGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBNYXRoLnNxcnQodW5pb25Db3VudChhLCBiKSAtIGludGVyc2VjdGlvbkNvdW50KGEsIGIpKTsgfSwgbGEpO1xyXG59XHJcbmV4cG9ydHMuc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzID0gc3ltbWV0cmljRGlmZkxpbmtMZW5ndGhzO1xyXG5mdW5jdGlvbiBqYWNjYXJkTGlua0xlbmd0aHMobGlua3MsIGxhLCB3KSB7XHJcbiAgICBpZiAodyA9PT0gdm9pZCAwKSB7IHcgPSAxOyB9XHJcbiAgICBjb21wdXRlTGlua0xlbmd0aHMobGlua3MsIHcsIGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKE9iamVjdC5rZXlzKGEpLmxlbmd0aCwgT2JqZWN0LmtleXMoYikubGVuZ3RoKSA8IDEuMSA/IDAgOiBpbnRlcnNlY3Rpb25Db3VudChhLCBiKSAvIHVuaW9uQ291bnQoYSwgYik7XHJcbiAgICB9LCBsYSk7XHJcbn1cclxuZXhwb3J0cy5qYWNjYXJkTGlua0xlbmd0aHMgPSBqYWNjYXJkTGlua0xlbmd0aHM7XHJcbmZ1bmN0aW9uIGdlbmVyYXRlRGlyZWN0ZWRFZGdlQ29uc3RyYWludHMobiwgbGlua3MsIGF4aXMsIGxhKSB7XHJcbiAgICB2YXIgY29tcG9uZW50cyA9IHN0cm9uZ2x5Q29ubmVjdGVkQ29tcG9uZW50cyhuLCBsaW5rcywgbGEpO1xyXG4gICAgdmFyIG5vZGVzID0ge307XHJcbiAgICBjb21wb25lbnRzLmZvckVhY2goZnVuY3Rpb24gKGMsIGkpIHtcclxuICAgICAgICByZXR1cm4gYy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiBub2Rlc1t2XSA9IGk7IH0pO1xyXG4gICAgfSk7XHJcbiAgICB2YXIgY29uc3RyYWludHMgPSBbXTtcclxuICAgIGxpbmtzLmZvckVhY2goZnVuY3Rpb24gKGwpIHtcclxuICAgICAgICB2YXIgdWkgPSBsYS5nZXRTb3VyY2VJbmRleChsKSwgdmkgPSBsYS5nZXRUYXJnZXRJbmRleChsKSwgdSA9IG5vZGVzW3VpXSwgdiA9IG5vZGVzW3ZpXTtcclxuICAgICAgICBpZiAodSAhPT0gdikge1xyXG4gICAgICAgICAgICBjb25zdHJhaW50cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGF4aXM6IGF4aXMsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiB1aSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiB2aSxcclxuICAgICAgICAgICAgICAgIGdhcDogbGEuZ2V0TWluU2VwYXJhdGlvbihsKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjb25zdHJhaW50cztcclxufVxyXG5leHBvcnRzLmdlbmVyYXRlRGlyZWN0ZWRFZGdlQ29uc3RyYWludHMgPSBnZW5lcmF0ZURpcmVjdGVkRWRnZUNvbnN0cmFpbnRzO1xyXG5mdW5jdGlvbiBzdHJvbmdseUNvbm5lY3RlZENvbXBvbmVudHMobnVtVmVydGljZXMsIGVkZ2VzLCBsYSkge1xyXG4gICAgdmFyIG5vZGVzID0gW107XHJcbiAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgdmFyIHN0YWNrID0gW107XHJcbiAgICB2YXIgY29tcG9uZW50cyA9IFtdO1xyXG4gICAgZnVuY3Rpb24gc3Ryb25nQ29ubmVjdCh2KSB7XHJcbiAgICAgICAgdi5pbmRleCA9IHYubG93bGluayA9IGluZGV4Kys7XHJcbiAgICAgICAgc3RhY2sucHVzaCh2KTtcclxuICAgICAgICB2Lm9uU3RhY2sgPSB0cnVlO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB2Lm91dDsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHcgPSBfYVtfaV07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygdy5pbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHN0cm9uZ0Nvbm5lY3Qodyk7XHJcbiAgICAgICAgICAgICAgICB2Lmxvd2xpbmsgPSBNYXRoLm1pbih2Lmxvd2xpbmssIHcubG93bGluayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAody5vblN0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICB2Lmxvd2xpbmsgPSBNYXRoLm1pbih2Lmxvd2xpbmssIHcuaW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh2Lmxvd2xpbmsgPT09IHYuaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB3ID0gc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB3Lm9uU3RhY2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wdXNoKHcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHcgPT09IHYpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudC5tYXAoZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYuaWQ7IH0pKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bVZlcnRpY2VzOyBpKyspIHtcclxuICAgICAgICBub2Rlcy5wdXNoKHsgaWQ6IGksIG91dDogW10gfSk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIGVkZ2VzXzEgPSBlZGdlczsgX2kgPCBlZGdlc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciBlID0gZWRnZXNfMVtfaV07XHJcbiAgICAgICAgdmFyIHZfMSA9IG5vZGVzW2xhLmdldFNvdXJjZUluZGV4KGUpXSwgdyA9IG5vZGVzW2xhLmdldFRhcmdldEluZGV4KGUpXTtcclxuICAgICAgICB2XzEub3V0LnB1c2godyk7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBfYSA9IDAsIG5vZGVzXzEgPSBub2RlczsgX2EgPCBub2Rlc18xLmxlbmd0aDsgX2ErKykge1xyXG4gICAgICAgIHZhciB2ID0gbm9kZXNfMVtfYV07XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2LmluZGV4ID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgc3Ryb25nQ29ubmVjdCh2KTtcclxuICAgIH1cclxuICAgIHJldHVybiBjb21wb25lbnRzO1xyXG59XHJcbmV4cG9ydHMuc3Ryb25nbHlDb25uZWN0ZWRDb21wb25lbnRzID0gc3Ryb25nbHlDb25uZWN0ZWRDb21wb25lbnRzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1saW5rbGVuZ3Rocy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgUG93ZXJFZGdlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBvd2VyRWRnZShzb3VyY2UsIHRhcmdldCwgdHlwZSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUG93ZXJFZGdlO1xyXG59KCkpO1xyXG5leHBvcnRzLlBvd2VyRWRnZSA9IFBvd2VyRWRnZTtcclxudmFyIENvbmZpZ3VyYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ29uZmlndXJhdGlvbihuLCBlZGdlcywgbGlua0FjY2Vzc29yLCByb290R3JvdXApIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMubGlua0FjY2Vzc29yID0gbGlua0FjY2Vzc29yO1xyXG4gICAgICAgIHRoaXMubW9kdWxlcyA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICB0aGlzLnJvb3RzID0gW107XHJcbiAgICAgICAgaWYgKHJvb3RHcm91cCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXRNb2R1bGVzRnJvbUdyb3VwKHJvb3RHcm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJvb3RzLnB1c2gobmV3IE1vZHVsZVNldCgpKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3RzWzBdLmFkZCh0aGlzLm1vZHVsZXNbaV0gPSBuZXcgTW9kdWxlKGkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5SID0gZWRnZXMubGVuZ3RoO1xyXG4gICAgICAgIGVkZ2VzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHMgPSBfdGhpcy5tb2R1bGVzW2xpbmtBY2Nlc3Nvci5nZXRTb3VyY2VJbmRleChlKV0sIHQgPSBfdGhpcy5tb2R1bGVzW2xpbmtBY2Nlc3Nvci5nZXRUYXJnZXRJbmRleChlKV0sIHR5cGUgPSBsaW5rQWNjZXNzb3IuZ2V0VHlwZShlKTtcclxuICAgICAgICAgICAgcy5vdXRnb2luZy5hZGQodHlwZSwgdCk7XHJcbiAgICAgICAgICAgIHQuaW5jb21pbmcuYWRkKHR5cGUsIHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgQ29uZmlndXJhdGlvbi5wcm90b3R5cGUuaW5pdE1vZHVsZXNGcm9tR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICB2YXIgbW9kdWxlU2V0ID0gbmV3IE1vZHVsZVNldCgpO1xyXG4gICAgICAgIHRoaXMucm9vdHMucHVzaChtb2R1bGVTZXQpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXAubGVhdmVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gZ3JvdXAubGVhdmVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgbW9kdWxlID0gbmV3IE1vZHVsZShub2RlLmlkKTtcclxuICAgICAgICAgICAgdGhpcy5tb2R1bGVzW25vZGUuaWRdID0gbW9kdWxlO1xyXG4gICAgICAgICAgICBtb2R1bGVTZXQuYWRkKG1vZHVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChncm91cC5ncm91cHMpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBncm91cC5ncm91cHMubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGdyb3VwLmdyb3Vwc1tqXTtcclxuICAgICAgICAgICAgICAgIHZhciBkZWZpbml0aW9uID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wICE9PSBcImxlYXZlc1wiICYmIHByb3AgIT09IFwiZ3JvdXBzXCIgJiYgY2hpbGQuaGFzT3duUHJvcGVydHkocHJvcCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25bcHJvcF0gPSBjaGlsZFtwcm9wXTtcclxuICAgICAgICAgICAgICAgIG1vZHVsZVNldC5hZGQobmV3IE1vZHVsZSgtMSAtIGosIG5ldyBMaW5rU2V0cygpLCBuZXcgTGlua1NldHMoKSwgdGhpcy5pbml0TW9kdWxlc0Zyb21Hcm91cChjaGlsZCksIGRlZmluaXRpb24pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbW9kdWxlU2V0O1xyXG4gICAgfTtcclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24gKGEsIGIsIGspIHtcclxuICAgICAgICBpZiAoayA9PT0gdm9pZCAwKSB7IGsgPSAwOyB9XHJcbiAgICAgICAgdmFyIGluSW50ID0gYS5pbmNvbWluZy5pbnRlcnNlY3Rpb24oYi5pbmNvbWluZyksIG91dEludCA9IGEub3V0Z29pbmcuaW50ZXJzZWN0aW9uKGIub3V0Z29pbmcpO1xyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IG5ldyBNb2R1bGVTZXQoKTtcclxuICAgICAgICBjaGlsZHJlbi5hZGQoYSk7XHJcbiAgICAgICAgY2hpbGRyZW4uYWRkKGIpO1xyXG4gICAgICAgIHZhciBtID0gbmV3IE1vZHVsZSh0aGlzLm1vZHVsZXMubGVuZ3RoLCBvdXRJbnQsIGluSW50LCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy5tb2R1bGVzLnB1c2gobSk7XHJcbiAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uIChzLCBpLCBvKSB7XHJcbiAgICAgICAgICAgIHMuZm9yQWxsKGZ1bmN0aW9uIChtcywgbGlua3R5cGUpIHtcclxuICAgICAgICAgICAgICAgIG1zLmZvckFsbChmdW5jdGlvbiAobikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBubHMgPSBuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIG5scy5hZGQobGlua3R5cGUsIG0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG5scy5yZW1vdmUobGlua3R5cGUsIGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5scy5yZW1vdmUobGlua3R5cGUsIGIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFbb10ucmVtb3ZlKGxpbmt0eXBlLCBuKTtcclxuICAgICAgICAgICAgICAgICAgICBiW29dLnJlbW92ZShsaW5rdHlwZSwgbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB1cGRhdGUob3V0SW50LCBcImluY29taW5nXCIsIFwib3V0Z29pbmdcIik7XHJcbiAgICAgICAgdXBkYXRlKGluSW50LCBcIm91dGdvaW5nXCIsIFwiaW5jb21pbmdcIik7XHJcbiAgICAgICAgdGhpcy5SIC09IGluSW50LmNvdW50KCkgKyBvdXRJbnQuY291bnQoKTtcclxuICAgICAgICB0aGlzLnJvb3RzW2tdLnJlbW92ZShhKTtcclxuICAgICAgICB0aGlzLnJvb3RzW2tdLnJlbW92ZShiKTtcclxuICAgICAgICB0aGlzLnJvb3RzW2tdLmFkZChtKTtcclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLnByb3RvdHlwZS5yb290TWVyZ2VzID0gZnVuY3Rpb24gKGspIHtcclxuICAgICAgICBpZiAoayA9PT0gdm9pZCAwKSB7IGsgPSAwOyB9XHJcbiAgICAgICAgdmFyIHJzID0gdGhpcy5yb290c1trXS5tb2R1bGVzKCk7XHJcbiAgICAgICAgdmFyIG4gPSBycy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIG1lcmdlcyA9IG5ldyBBcnJheShuICogKG4gLSAxKSk7XHJcbiAgICAgICAgdmFyIGN0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlfID0gbiAtIDE7IGkgPCBpXzsgKytpKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IG47ICsraikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGEgPSByc1tpXSwgYiA9IHJzW2pdO1xyXG4gICAgICAgICAgICAgICAgbWVyZ2VzW2N0cl0gPSB7IGlkOiBjdHIsIG5FZGdlczogdGhpcy5uRWRnZXMoYSwgYiksIGE6IGEsIGI6IGIgfTtcclxuICAgICAgICAgICAgICAgIGN0cisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtZXJnZXM7XHJcbiAgICB9O1xyXG4gICAgQ29uZmlndXJhdGlvbi5wcm90b3R5cGUuZ3JlZWR5TWVyZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJvb3RzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJvb3RzW2ldLm1vZHVsZXMoKS5sZW5ndGggPCAyKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHZhciBtcyA9IHRoaXMucm9vdE1lcmdlcyhpKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLm5FZGdlcyA9PSBiLm5FZGdlcyA/IGEuaWQgLSBiLmlkIDogYS5uRWRnZXMgLSBiLm5FZGdlczsgfSk7XHJcbiAgICAgICAgICAgIHZhciBtID0gbXNbMF07XHJcbiAgICAgICAgICAgIGlmIChtLm5FZGdlcyA+PSB0aGlzLlIpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgdGhpcy5tZXJnZShtLmEsIG0uYiwgaSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLnByb3RvdHlwZS5uRWRnZXMgPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciBpbkludCA9IGEuaW5jb21pbmcuaW50ZXJzZWN0aW9uKGIuaW5jb21pbmcpLCBvdXRJbnQgPSBhLm91dGdvaW5nLmludGVyc2VjdGlvbihiLm91dGdvaW5nKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5SIC0gaW5JbnQuY291bnQoKSAtIG91dEludC5jb3VudCgpO1xyXG4gICAgfTtcclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLmdldEdyb3VwSGllcmFyY2h5ID0gZnVuY3Rpb24gKHJldGFyZ2V0ZWRFZGdlcykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGdyb3VwcyA9IFtdO1xyXG4gICAgICAgIHZhciByb290ID0ge307XHJcbiAgICAgICAgdG9Hcm91cHModGhpcy5yb290c1swXSwgcm9vdCwgZ3JvdXBzKTtcclxuICAgICAgICB2YXIgZXMgPSB0aGlzLmFsbEVkZ2VzKCk7XHJcbiAgICAgICAgZXMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgYSA9IF90aGlzLm1vZHVsZXNbZS5zb3VyY2VdO1xyXG4gICAgICAgICAgICB2YXIgYiA9IF90aGlzLm1vZHVsZXNbZS50YXJnZXRdO1xyXG4gICAgICAgICAgICByZXRhcmdldGVkRWRnZXMucHVzaChuZXcgUG93ZXJFZGdlKHR5cGVvZiBhLmdpZCA9PT0gXCJ1bmRlZmluZWRcIiA/IGUuc291cmNlIDogZ3JvdXBzW2EuZ2lkXSwgdHlwZW9mIGIuZ2lkID09PSBcInVuZGVmaW5lZFwiID8gZS50YXJnZXQgOiBncm91cHNbYi5naWRdLCBlLnR5cGUpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZ3JvdXBzO1xyXG4gICAgfTtcclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLmFsbEVkZ2VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlcyA9IFtdO1xyXG4gICAgICAgIENvbmZpZ3VyYXRpb24uZ2V0RWRnZXModGhpcy5yb290c1swXSwgZXMpO1xyXG4gICAgICAgIHJldHVybiBlcztcclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLmdldEVkZ2VzID0gZnVuY3Rpb24gKG1vZHVsZXMsIGVzKSB7XHJcbiAgICAgICAgbW9kdWxlcy5mb3JBbGwoZnVuY3Rpb24gKG0pIHtcclxuICAgICAgICAgICAgbS5nZXRFZGdlcyhlcyk7XHJcbiAgICAgICAgICAgIENvbmZpZ3VyYXRpb24uZ2V0RWRnZXMobS5jaGlsZHJlbiwgZXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDb25maWd1cmF0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLkNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uO1xyXG5mdW5jdGlvbiB0b0dyb3Vwcyhtb2R1bGVzLCBncm91cCwgZ3JvdXBzKSB7XHJcbiAgICBtb2R1bGVzLmZvckFsbChmdW5jdGlvbiAobSkge1xyXG4gICAgICAgIGlmIChtLmlzTGVhZigpKSB7XHJcbiAgICAgICAgICAgIGlmICghZ3JvdXAubGVhdmVzKVxyXG4gICAgICAgICAgICAgICAgZ3JvdXAubGVhdmVzID0gW107XHJcbiAgICAgICAgICAgIGdyb3VwLmxlYXZlcy5wdXNoKG0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGcgPSBncm91cDtcclxuICAgICAgICAgICAgbS5naWQgPSBncm91cHMubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoIW0uaXNJc2xhbmQoKSB8fCBtLmlzUHJlZGVmaW5lZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBnID0geyBpZDogbS5naWQgfTtcclxuICAgICAgICAgICAgICAgIGlmIChtLmlzUHJlZGVmaW5lZCgpKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gbS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnW3Byb3BdID0gbS5kZWZpbml0aW9uW3Byb3BdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFncm91cC5ncm91cHMpXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXAuZ3JvdXBzID0gW107XHJcbiAgICAgICAgICAgICAgICBncm91cC5ncm91cHMucHVzaChtLmdpZCk7XHJcbiAgICAgICAgICAgICAgICBncm91cHMucHVzaChnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b0dyb3VwcyhtLmNoaWxkcmVuLCBnLCBncm91cHMpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbnZhciBNb2R1bGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTW9kdWxlKGlkLCBvdXRnb2luZywgaW5jb21pbmcsIGNoaWxkcmVuLCBkZWZpbml0aW9uKSB7XHJcbiAgICAgICAgaWYgKG91dGdvaW5nID09PSB2b2lkIDApIHsgb3V0Z29pbmcgPSBuZXcgTGlua1NldHMoKTsgfVxyXG4gICAgICAgIGlmIChpbmNvbWluZyA9PT0gdm9pZCAwKSB7IGluY29taW5nID0gbmV3IExpbmtTZXRzKCk7IH1cclxuICAgICAgICBpZiAoY2hpbGRyZW4gPT09IHZvaWQgMCkgeyBjaGlsZHJlbiA9IG5ldyBNb2R1bGVTZXQoKTsgfVxyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLm91dGdvaW5nID0gb3V0Z29pbmc7XHJcbiAgICAgICAgdGhpcy5pbmNvbWluZyA9IGluY29taW5nO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgICB0aGlzLmRlZmluaXRpb24gPSBkZWZpbml0aW9uO1xyXG4gICAgfVxyXG4gICAgTW9kdWxlLnByb3RvdHlwZS5nZXRFZGdlcyA9IGZ1bmN0aW9uIChlcykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5vdXRnb2luZy5mb3JBbGwoZnVuY3Rpb24gKG1zLCBlZGdldHlwZSkge1xyXG4gICAgICAgICAgICBtcy5mb3JBbGwoZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgZXMucHVzaChuZXcgUG93ZXJFZGdlKF90aGlzLmlkLCB0YXJnZXQuaWQsIGVkZ2V0eXBlKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZS5wcm90b3R5cGUuaXNMZWFmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmNvdW50KCkgPT09IDA7XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlLnByb3RvdHlwZS5pc0lzbGFuZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vdXRnb2luZy5jb3VudCgpID09PSAwICYmIHRoaXMuaW5jb21pbmcuY291bnQoKSA9PT0gMDtcclxuICAgIH07XHJcbiAgICBNb2R1bGUucHJvdG90eXBlLmlzUHJlZGVmaW5lZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuZGVmaW5pdGlvbiAhPT0gXCJ1bmRlZmluZWRcIjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gTW9kdWxlO1xyXG59KCkpO1xyXG5leHBvcnRzLk1vZHVsZSA9IE1vZHVsZTtcclxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uKG0sIG4pIHtcclxuICAgIHZhciBpID0ge307XHJcbiAgICBmb3IgKHZhciB2IGluIG0pXHJcbiAgICAgICAgaWYgKHYgaW4gbilcclxuICAgICAgICAgICAgaVt2XSA9IG1bdl07XHJcbiAgICByZXR1cm4gaTtcclxufVxyXG52YXIgTW9kdWxlU2V0ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE1vZHVsZVNldCgpIHtcclxuICAgICAgICB0aGlzLnRhYmxlID0ge307XHJcbiAgICB9XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnRhYmxlKS5sZW5ndGg7XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlU2V0LnByb3RvdHlwZS5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IE1vZHVsZVNldCgpO1xyXG4gICAgICAgIHJlc3VsdC50YWJsZSA9IGludGVyc2VjdGlvbih0aGlzLnRhYmxlLCBvdGhlci50YWJsZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmludGVyc2VjdGlvbkNvdW50ID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0aW9uKG90aGVyKS5jb3VudCgpO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICByZXR1cm4gaWQgaW4gdGhpcy50YWJsZTtcclxuICAgIH07XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChtKSB7XHJcbiAgICAgICAgdGhpcy50YWJsZVttLmlkXSA9IG07XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlU2V0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnRhYmxlW20uaWRdO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUuZm9yQWxsID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICBmb3IgKHZhciBtaWQgaW4gdGhpcy50YWJsZSkge1xyXG4gICAgICAgICAgICBmKHRoaXMudGFibGVbbWlkXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUubW9kdWxlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdnMgPSBbXTtcclxuICAgICAgICB0aGlzLmZvckFsbChmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICBpZiAoIW0uaXNQcmVkZWZpbmVkKCkpXHJcbiAgICAgICAgICAgICAgICB2cy5wdXNoKG0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB2cztcclxuICAgIH07XHJcbiAgICByZXR1cm4gTW9kdWxlU2V0O1xyXG59KCkpO1xyXG5leHBvcnRzLk1vZHVsZVNldCA9IE1vZHVsZVNldDtcclxudmFyIExpbmtTZXRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpbmtTZXRzKCkge1xyXG4gICAgICAgIHRoaXMuc2V0cyA9IHt9O1xyXG4gICAgICAgIHRoaXMubiA9IDA7XHJcbiAgICB9XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubjtcclxuICAgIH07XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5mb3JBbGxNb2R1bGVzKGZ1bmN0aW9uIChtKSB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0ICYmIG0uaWQgPT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAobGlua3R5cGUsIG0pIHtcclxuICAgICAgICB2YXIgcyA9IGxpbmt0eXBlIGluIHRoaXMuc2V0cyA/IHRoaXMuc2V0c1tsaW5rdHlwZV0gOiB0aGlzLnNldHNbbGlua3R5cGVdID0gbmV3IE1vZHVsZVNldCgpO1xyXG4gICAgICAgIHMuYWRkKG0pO1xyXG4gICAgICAgICsrdGhpcy5uO1xyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobGlua3R5cGUsIG0pIHtcclxuICAgICAgICB2YXIgbXMgPSB0aGlzLnNldHNbbGlua3R5cGVdO1xyXG4gICAgICAgIG1zLnJlbW92ZShtKTtcclxuICAgICAgICBpZiAobXMuY291bnQoKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zZXRzW2xpbmt0eXBlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLS10aGlzLm47XHJcbiAgICB9O1xyXG4gICAgTGlua1NldHMucHJvdG90eXBlLmZvckFsbCA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgZm9yICh2YXIgbGlua3R5cGUgaW4gdGhpcy5zZXRzKSB7XHJcbiAgICAgICAgICAgIGYodGhpcy5zZXRzW2xpbmt0eXBlXSwgTnVtYmVyKGxpbmt0eXBlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5mb3JBbGxNb2R1bGVzID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICB0aGlzLmZvckFsbChmdW5jdGlvbiAobXMsIGx0KSB7IHJldHVybiBtcy5mb3JBbGwoZik7IH0pO1xyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IExpbmtTZXRzKCk7XHJcbiAgICAgICAgdGhpcy5mb3JBbGwoZnVuY3Rpb24gKG1zLCBsdCkge1xyXG4gICAgICAgICAgICBpZiAobHQgaW4gb3RoZXIuc2V0cykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGkgPSBtcy5pbnRlcnNlY3Rpb24ob3RoZXIuc2V0c1tsdF0pLCBuID0gaS5jb3VudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG4gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNldHNbbHRdID0gaTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQubiArPSBuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gTGlua1NldHM7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTGlua1NldHMgPSBMaW5rU2V0cztcclxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uQ291bnQobSwgbikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGludGVyc2VjdGlvbihtLCBuKSkubGVuZ3RoO1xyXG59XHJcbmZ1bmN0aW9uIGdldEdyb3Vwcyhub2RlcywgbGlua3MsIGxhLCByb290R3JvdXApIHtcclxuICAgIHZhciBuID0gbm9kZXMubGVuZ3RoLCBjID0gbmV3IENvbmZpZ3VyYXRpb24obiwgbGlua3MsIGxhLCByb290R3JvdXApO1xyXG4gICAgd2hpbGUgKGMuZ3JlZWR5TWVyZ2UoKSlcclxuICAgICAgICA7XHJcbiAgICB2YXIgcG93ZXJFZGdlcyA9IFtdO1xyXG4gICAgdmFyIGcgPSBjLmdldEdyb3VwSGllcmFyY2h5KHBvd2VyRWRnZXMpO1xyXG4gICAgcG93ZXJFZGdlcy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIGYgPSBmdW5jdGlvbiAoZW5kKSB7XHJcbiAgICAgICAgICAgIHZhciBnID0gZVtlbmRdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGcgPT0gXCJudW1iZXJcIilcclxuICAgICAgICAgICAgICAgIGVbZW5kXSA9IG5vZGVzW2ddO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZihcInNvdXJjZVwiKTtcclxuICAgICAgICBmKFwidGFyZ2V0XCIpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4geyBncm91cHM6IGcsIHBvd2VyRWRnZXM6IHBvd2VyRWRnZXMgfTtcclxufVxyXG5leHBvcnRzLmdldEdyb3VwcyA9IGdldEdyb3VwcztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cG93ZXJncmFwaC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgUGFpcmluZ0hlYXAgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUGFpcmluZ0hlYXAoZWxlbSkge1xyXG4gICAgICAgIHRoaXMuZWxlbSA9IGVsZW07XHJcbiAgICAgICAgdGhpcy5zdWJoZWFwcyA9IFtdO1xyXG4gICAgfVxyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHN0ciA9IFwiXCIsIG5lZWRDb21tYSA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJoZWFwcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgc3ViaGVhcCA9IHRoaXMuc3ViaGVhcHNbaV07XHJcbiAgICAgICAgICAgIGlmICghc3ViaGVhcC5lbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBuZWVkQ29tbWEgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZWVkQ29tbWEpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ciArIFwiLFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ciArIHN1YmhlYXAudG9TdHJpbmcoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBuZWVkQ29tbWEgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RyICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IFwiKFwiICsgc3RyICsgXCIpXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAodGhpcy5lbGVtID8gc2VsZWN0b3IodGhpcy5lbGVtKSA6IFwiXCIpICsgc3RyO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZW1wdHkoKSkge1xyXG4gICAgICAgICAgICBmKHRoaXMuZWxlbSwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ViaGVhcHMuZm9yRWFjaChmdW5jdGlvbiAocykgeyByZXR1cm4gcy5mb3JFYWNoKGYpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVtcHR5KCkgPyAwIDogMSArIHRoaXMuc3ViaGVhcHMucmVkdWNlKGZ1bmN0aW9uIChuLCBoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuICsgaC5jb3VudCgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5taW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbTtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbSA9PSBudWxsO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMgPT09IGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJoZWFwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJoZWFwc1tpXS5jb250YWlucyhoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmlzSGVhcCA9IGZ1bmN0aW9uIChsZXNzVGhhbikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViaGVhcHMuZXZlcnkoZnVuY3Rpb24gKGgpIHsgcmV0dXJuIGxlc3NUaGFuKF90aGlzLmVsZW0sIGguZWxlbSkgJiYgaC5pc0hlYXAobGVzc1RoYW4pOyB9KTtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24gKG9iaiwgbGVzc1RoYW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXJnZShuZXcgUGFpcmluZ0hlYXAob2JqKSwgbGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uIChoZWFwMiwgbGVzc1RoYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5lbXB0eSgpKVxyXG4gICAgICAgICAgICByZXR1cm4gaGVhcDI7XHJcbiAgICAgICAgZWxzZSBpZiAoaGVhcDIuZW1wdHkoKSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgZWxzZSBpZiAobGVzc1RoYW4odGhpcy5lbGVtLCBoZWFwMi5lbGVtKSkge1xyXG4gICAgICAgICAgICB0aGlzLnN1YmhlYXBzLnB1c2goaGVhcDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhlYXAyLnN1YmhlYXBzLnB1c2godGhpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWFwMjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLnJlbW92ZU1pbiA9IGZ1bmN0aW9uIChsZXNzVGhhbikge1xyXG4gICAgICAgIGlmICh0aGlzLmVtcHR5KCkpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2VQYWlycyhsZXNzVGhhbik7XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLm1lcmdlUGFpcnMgPSBmdW5jdGlvbiAobGVzc1RoYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5zdWJoZWFwcy5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQYWlyaW5nSGVhcChudWxsKTtcclxuICAgICAgICBlbHNlIGlmICh0aGlzLnN1YmhlYXBzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YmhlYXBzWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0UGFpciA9IHRoaXMuc3ViaGVhcHMucG9wKCkubWVyZ2UodGhpcy5zdWJoZWFwcy5wb3AoKSwgbGVzc1RoYW4pO1xyXG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nID0gdGhpcy5tZXJnZVBhaXJzKGxlc3NUaGFuKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0UGFpci5tZXJnZShyZW1haW5pbmcsIGxlc3NUaGFuKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmRlY3JlYXNlS2V5ID0gZnVuY3Rpb24gKHN1YmhlYXAsIG5ld1ZhbHVlLCBzZXRIZWFwTm9kZSwgbGVzc1RoYW4pIHtcclxuICAgICAgICB2YXIgbmV3SGVhcCA9IHN1YmhlYXAucmVtb3ZlTWluKGxlc3NUaGFuKTtcclxuICAgICAgICBzdWJoZWFwLmVsZW0gPSBuZXdIZWFwLmVsZW07XHJcbiAgICAgICAgc3ViaGVhcC5zdWJoZWFwcyA9IG5ld0hlYXAuc3ViaGVhcHM7XHJcbiAgICAgICAgaWYgKHNldEhlYXBOb2RlICE9PSBudWxsICYmIG5ld0hlYXAuZWxlbSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzZXRIZWFwTm9kZShzdWJoZWFwLmVsZW0sIHN1YmhlYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFpcmluZ05vZGUgPSBuZXcgUGFpcmluZ0hlYXAobmV3VmFsdWUpO1xyXG4gICAgICAgIGlmIChzZXRIZWFwTm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzZXRIZWFwTm9kZShuZXdWYWx1ZSwgcGFpcmluZ05vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5tZXJnZShwYWlyaW5nTm9kZSwgbGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQYWlyaW5nSGVhcDtcclxufSgpKTtcclxuZXhwb3J0cy5QYWlyaW5nSGVhcCA9IFBhaXJpbmdIZWFwO1xyXG52YXIgUHJpb3JpdHlRdWV1ZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQcmlvcml0eVF1ZXVlKGxlc3NUaGFuKSB7XHJcbiAgICAgICAgdGhpcy5sZXNzVGhhbiA9IGxlc3NUaGFuO1xyXG4gICAgfVxyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUudG9wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVtcHR5KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnJvb3QuZWxlbTtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBhcmdzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFpcmluZ05vZGU7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGFyZzsgYXJnID0gYXJnc1tpXTsgKytpKSB7XHJcbiAgICAgICAgICAgIHBhaXJpbmdOb2RlID0gbmV3IFBhaXJpbmdIZWFwKGFyZyk7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHRoaXMuZW1wdHkoKSA/XHJcbiAgICAgICAgICAgICAgICBwYWlyaW5nTm9kZSA6IHRoaXMucm9vdC5tZXJnZShwYWlyaW5nTm9kZSwgdGhpcy5sZXNzVGhhbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYWlyaW5nTm9kZTtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMucm9vdCB8fCAhdGhpcy5yb290LmVsZW07XHJcbiAgICB9O1xyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuaXNIZWFwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvb3QuaXNIZWFwKHRoaXMubGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIHRoaXMucm9vdC5mb3JFYWNoKGYpO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5lbXB0eSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb2JqID0gdGhpcy5yb290Lm1pbigpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHRoaXMucm9vdC5yZW1vdmVNaW4odGhpcy5sZXNzVGhhbik7XHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5yZWR1Y2VLZXkgPSBmdW5jdGlvbiAoaGVhcE5vZGUsIG5ld0tleSwgc2V0SGVhcE5vZGUpIHtcclxuICAgICAgICBpZiAoc2V0SGVhcE5vZGUgPT09IHZvaWQgMCkgeyBzZXRIZWFwTm9kZSA9IG51bGw7IH1cclxuICAgICAgICB0aGlzLnJvb3QgPSB0aGlzLnJvb3QuZGVjcmVhc2VLZXkoaGVhcE5vZGUsIG5ld0tleSwgc2V0SGVhcE5vZGUsIHRoaXMubGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdC50b1N0cmluZyhzZWxlY3Rvcik7XHJcbiAgICB9O1xyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdC5jb3VudCgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQcmlvcml0eVF1ZXVlO1xyXG59KCkpO1xyXG5leHBvcnRzLlByaW9yaXR5UXVldWUgPSBQcmlvcml0eVF1ZXVlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcXVldWUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBUcmVlQmFzZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBUcmVlQmFzZSgpIHtcclxuICAgICAgICB0aGlzLmZpbmRJdGVyID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHJlcyA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgICAgIHZhciBpdGVyID0gdGhpcy5pdGVyYXRvcigpO1xyXG4gICAgICAgICAgICB3aGlsZSAocmVzICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYyA9IHRoaXMuX2NvbXBhcmF0b3IoZGF0YSwgcmVzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVyLl9jdXJzb3IgPSByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVyLl9hbmNlc3RvcnMucHVzaChyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5nZXRfY2hpbGQoYyA+IDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fcm9vdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zaXplID0gMDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJlcyA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgd2hpbGUgKHJlcyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgYyA9IHRoaXMuX2NvbXBhcmF0b3IoZGF0YSwgcmVzLmRhdGEpO1xyXG4gICAgICAgICAgICBpZiAoYyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzID0gcmVzLmdldF9jaGlsZChjID4gMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLmxvd2VyQm91bmQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ib3VuZChkYXRhLCB0aGlzLl9jb21wYXJhdG9yKTtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUudXBwZXJCb3VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGNtcCA9IHRoaXMuX2NvbXBhcmF0b3I7XHJcbiAgICAgICAgZnVuY3Rpb24gcmV2ZXJzZV9jbXAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gY21wKGIsIGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYm91bmQoZGF0YSwgcmV2ZXJzZV9jbXApO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5taW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlcyA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgaWYgKHJlcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHJlcy5sZWZ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJlcyA9IHJlcy5sZWZ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzID0gdGhpcy5fcm9vdDtcclxuICAgICAgICBpZiAocmVzID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAocmVzLnJpZ2h0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJlcyA9IHJlcy5yaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5pdGVyYXRvciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKHRoaXMpO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24gKGNiKSB7XHJcbiAgICAgICAgdmFyIGl0ID0gdGhpcy5pdGVyYXRvcigpLCBkYXRhO1xyXG4gICAgICAgIHdoaWxlICgoZGF0YSA9IGl0Lm5leHQoKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2IoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5yZWFjaCA9IGZ1bmN0aW9uIChjYikge1xyXG4gICAgICAgIHZhciBpdCA9IHRoaXMuaXRlcmF0b3IoKSwgZGF0YTtcclxuICAgICAgICB3aGlsZSAoKGRhdGEgPSBpdC5wcmV2KCkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNiKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUuX2JvdW5kID0gZnVuY3Rpb24gKGRhdGEsIGNtcCkge1xyXG4gICAgICAgIHZhciBjdXIgPSB0aGlzLl9yb290O1xyXG4gICAgICAgIHZhciBpdGVyID0gdGhpcy5pdGVyYXRvcigpO1xyXG4gICAgICAgIHdoaWxlIChjdXIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIGMgPSB0aGlzLl9jb21wYXJhdG9yKGRhdGEsIGN1ci5kYXRhKTtcclxuICAgICAgICAgICAgaWYgKGMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGl0ZXIuX2N1cnNvciA9IGN1cjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGl0ZXIuX2FuY2VzdG9ycy5wdXNoKGN1cik7XHJcbiAgICAgICAgICAgIGN1ciA9IGN1ci5nZXRfY2hpbGQoYyA+IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gaXRlci5fYW5jZXN0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGN1ciA9IGl0ZXIuX2FuY2VzdG9yc1tpXTtcclxuICAgICAgICAgICAgaWYgKGNtcChkYXRhLCBjdXIuZGF0YSkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVyLl9jdXJzb3IgPSBjdXI7XHJcbiAgICAgICAgICAgICAgICBpdGVyLl9hbmNlc3RvcnMubGVuZ3RoID0gaTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGl0ZXIuX2FuY2VzdG9ycy5sZW5ndGggPSAwO1xyXG4gICAgICAgIHJldHVybiBpdGVyO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIHJldHVybiBUcmVlQmFzZTtcclxufSgpKTtcclxuZXhwb3J0cy5UcmVlQmFzZSA9IFRyZWVCYXNlO1xyXG52YXIgSXRlcmF0b3IgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gSXRlcmF0b3IodHJlZSkge1xyXG4gICAgICAgIHRoaXMuX3RyZWUgPSB0cmVlO1xyXG4gICAgICAgIHRoaXMuX2FuY2VzdG9ycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2N1cnNvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBJdGVyYXRvci5wcm90b3R5cGUuZGF0YSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY3Vyc29yICE9PSBudWxsID8gdGhpcy5fY3Vyc29yLmRhdGEgOiBudWxsO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIEl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJzb3IgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIHJvb3QgPSB0aGlzLl90cmVlLl9yb290O1xyXG4gICAgICAgICAgICBpZiAocm9vdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluTm9kZShyb290KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnNvci5yaWdodCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNhdmU7XHJcbiAgICAgICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZSA9IHRoaXMuX2N1cnNvcjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fYW5jZXN0b3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJzb3IgPSB0aGlzLl9hbmNlc3RvcnMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJzb3IgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IHdoaWxlICh0aGlzLl9jdXJzb3IucmlnaHQgPT09IHNhdmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYW5jZXN0b3JzLnB1c2godGhpcy5fY3Vyc29yKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21pbk5vZGUodGhpcy5fY3Vyc29yLnJpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY3Vyc29yICE9PSBudWxsID8gdGhpcy5fY3Vyc29yLmRhdGEgOiBudWxsO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIEl0ZXJhdG9yLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJzb3IgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIHJvb3QgPSB0aGlzLl90cmVlLl9yb290O1xyXG4gICAgICAgICAgICBpZiAocm9vdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4Tm9kZShyb290KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnNvci5sZWZ0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2F2ZTtcclxuICAgICAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlID0gdGhpcy5fY3Vyc29yO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9hbmNlc3RvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnNvciA9IHRoaXMuX2FuY2VzdG9ycy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnNvciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gd2hpbGUgKHRoaXMuX2N1cnNvci5sZWZ0ID09PSBzYXZlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FuY2VzdG9ycy5wdXNoKHRoaXMuX2N1cnNvcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhOb2RlKHRoaXMuX2N1cnNvci5sZWZ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY3Vyc29yICE9PSBudWxsID8gdGhpcy5fY3Vyc29yLmRhdGEgOiBudWxsO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIEl0ZXJhdG9yLnByb3RvdHlwZS5fbWluTm9kZSA9IGZ1bmN0aW9uIChzdGFydCkge1xyXG4gICAgICAgIHdoaWxlIChzdGFydC5sZWZ0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FuY2VzdG9ycy5wdXNoKHN0YXJ0KTtcclxuICAgICAgICAgICAgc3RhcnQgPSBzdGFydC5sZWZ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jdXJzb3IgPSBzdGFydDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBJdGVyYXRvci5wcm90b3R5cGUuX21heE5vZGUgPSBmdW5jdGlvbiAoc3RhcnQpIHtcclxuICAgICAgICB3aGlsZSAoc3RhcnQucmlnaHQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fYW5jZXN0b3JzLnB1c2goc3RhcnQpO1xyXG4gICAgICAgICAgICBzdGFydCA9IHN0YXJ0LnJpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jdXJzb3IgPSBzdGFydDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICByZXR1cm4gSXRlcmF0b3I7XHJcbn0oKSk7XHJcbmV4cG9ydHMuSXRlcmF0b3IgPSBJdGVyYXRvcjtcclxudmFyIE5vZGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm9kZShkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmxlZnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucmlnaHQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucmVkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIE5vZGUucHJvdG90eXBlLmdldF9jaGlsZCA9IGZ1bmN0aW9uIChkaXIpIHtcclxuICAgICAgICByZXR1cm4gZGlyID8gdGhpcy5yaWdodCA6IHRoaXMubGVmdDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBOb2RlLnByb3RvdHlwZS5zZXRfY2hpbGQgPSBmdW5jdGlvbiAoZGlyLCB2YWwpIHtcclxuICAgICAgICBpZiAoZGlyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIDtcclxuICAgIHJldHVybiBOb2RlO1xyXG59KCkpO1xyXG52YXIgUkJUcmVlID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhSQlRyZWUsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBSQlRyZWUoY29tcGFyYXRvcikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuX3Jvb3QgPSBudWxsO1xyXG4gICAgICAgIF90aGlzLl9jb21wYXJhdG9yID0gY29tcGFyYXRvcjtcclxuICAgICAgICBfdGhpcy5zaXplID0gMDtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBSQlRyZWUucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJldCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLl9yb290ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QgPSBuZXcgTm9kZShkYXRhKTtcclxuICAgICAgICAgICAgcmV0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5zaXplKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgaGVhZCA9IG5ldyBOb2RlKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIHZhciBkaXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIGxhc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIGdwID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIGdncCA9IGhlYWQ7XHJcbiAgICAgICAgICAgIHZhciBwID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLl9yb290O1xyXG4gICAgICAgICAgICBnZ3AucmlnaHQgPSB0aGlzLl9yb290O1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlID0gbmV3IE5vZGUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcC5zZXRfY2hpbGQoZGlyLCBub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoUkJUcmVlLmlzX3JlZChub2RlLmxlZnQpICYmIFJCVHJlZS5pc19yZWQobm9kZS5yaWdodCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5sZWZ0LnJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmlnaHQucmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoUkJUcmVlLmlzX3JlZChub2RlKSAmJiBSQlRyZWUuaXNfcmVkKHApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpcjIgPSBnZ3AucmlnaHQgPT09IGdwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlID09PSBwLmdldF9jaGlsZChsYXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZ3Auc2V0X2NoaWxkKGRpcjIsIFJCVHJlZS5zaW5nbGVfcm90YXRlKGdwLCAhbGFzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2dwLnNldF9jaGlsZChkaXIyLCBSQlRyZWUuZG91YmxlX3JvdGF0ZShncCwgIWxhc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgY21wID0gdGhpcy5fY29tcGFyYXRvcihub2RlLmRhdGEsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGFzdCA9IGRpcjtcclxuICAgICAgICAgICAgICAgIGRpciA9IGNtcCA8IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ3AgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBnZ3AgPSBncDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGdwID0gcDtcclxuICAgICAgICAgICAgICAgIHAgPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUuZ2V0X2NoaWxkKGRpcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcm9vdCA9IGhlYWQucmlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Jvb3QucmVkID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBSQlRyZWUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Jvb3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaGVhZCA9IG5ldyBOb2RlKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBoZWFkO1xyXG4gICAgICAgIG5vZGUucmlnaHQgPSB0aGlzLl9yb290O1xyXG4gICAgICAgIHZhciBwID0gbnVsbDtcclxuICAgICAgICB2YXIgZ3AgPSBudWxsO1xyXG4gICAgICAgIHZhciBmb3VuZCA9IG51bGw7XHJcbiAgICAgICAgdmFyIGRpciA9IHRydWU7XHJcbiAgICAgICAgd2hpbGUgKG5vZGUuZ2V0X2NoaWxkKGRpcikgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIGxhc3QgPSBkaXI7XHJcbiAgICAgICAgICAgIGdwID0gcDtcclxuICAgICAgICAgICAgcCA9IG5vZGU7XHJcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLmdldF9jaGlsZChkaXIpO1xyXG4gICAgICAgICAgICB2YXIgY21wID0gdGhpcy5fY29tcGFyYXRvcihkYXRhLCBub2RlLmRhdGEpO1xyXG4gICAgICAgICAgICBkaXIgPSBjbXAgPiAwO1xyXG4gICAgICAgICAgICBpZiAoY21wID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IG5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFSQlRyZWUuaXNfcmVkKG5vZGUpICYmICFSQlRyZWUuaXNfcmVkKG5vZGUuZ2V0X2NoaWxkKGRpcikpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoUkJUcmVlLmlzX3JlZChub2RlLmdldF9jaGlsZCghZGlyKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3IgPSBSQlRyZWUuc2luZ2xlX3JvdGF0ZShub2RlLCBkaXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHAuc2V0X2NoaWxkKGxhc3QsIHNyKTtcclxuICAgICAgICAgICAgICAgICAgICBwID0gc3I7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghUkJUcmVlLmlzX3JlZChub2RlLmdldF9jaGlsZCghZGlyKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2libGluZyA9IHAuZ2V0X2NoaWxkKCFsYXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2libGluZyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIVJCVHJlZS5pc19yZWQoc2libGluZy5nZXRfY2hpbGQoIWxhc3QpKSAmJiAhUkJUcmVlLmlzX3JlZChzaWJsaW5nLmdldF9jaGlsZChsYXN0KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAucmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWJsaW5nLnJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlyMiA9IGdwLnJpZ2h0ID09PSBwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJCVHJlZS5pc19yZWQoc2libGluZy5nZXRfY2hpbGQobGFzdCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Auc2V0X2NoaWxkKGRpcjIsIFJCVHJlZS5kb3VibGVfcm90YXRlKHAsIGxhc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKFJCVHJlZS5pc19yZWQoc2libGluZy5nZXRfY2hpbGQoIWxhc3QpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdwLnNldF9jaGlsZChkaXIyLCBSQlRyZWUuc2luZ2xlX3JvdGF0ZShwLCBsYXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ3BjID0gZ3AuZ2V0X2NoaWxkKGRpcjIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3BjLnJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncGMubGVmdC5yZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdwYy5yaWdodC5yZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZm91bmQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgZm91bmQuZGF0YSA9IG5vZGUuZGF0YTtcclxuICAgICAgICAgICAgcC5zZXRfY2hpbGQocC5yaWdodCA9PT0gbm9kZSwgbm9kZS5nZXRfY2hpbGQobm9kZS5sZWZ0ID09PSBudWxsKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yb290ID0gaGVhZC5yaWdodDtcclxuICAgICAgICBpZiAodGhpcy5fcm9vdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yb290LnJlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmQgIT09IG51bGw7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgUkJUcmVlLmlzX3JlZCA9IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGUgIT09IG51bGwgJiYgbm9kZS5yZWQ7XHJcbiAgICB9O1xyXG4gICAgUkJUcmVlLnNpbmdsZV9yb3RhdGUgPSBmdW5jdGlvbiAocm9vdCwgZGlyKSB7XHJcbiAgICAgICAgdmFyIHNhdmUgPSByb290LmdldF9jaGlsZCghZGlyKTtcclxuICAgICAgICByb290LnNldF9jaGlsZCghZGlyLCBzYXZlLmdldF9jaGlsZChkaXIpKTtcclxuICAgICAgICBzYXZlLnNldF9jaGlsZChkaXIsIHJvb3QpO1xyXG4gICAgICAgIHJvb3QucmVkID0gdHJ1ZTtcclxuICAgICAgICBzYXZlLnJlZCA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBzYXZlO1xyXG4gICAgfTtcclxuICAgIFJCVHJlZS5kb3VibGVfcm90YXRlID0gZnVuY3Rpb24gKHJvb3QsIGRpcikge1xyXG4gICAgICAgIHJvb3Quc2V0X2NoaWxkKCFkaXIsIFJCVHJlZS5zaW5nbGVfcm90YXRlKHJvb3QuZ2V0X2NoaWxkKCFkaXIpLCAhZGlyKSk7XHJcbiAgICAgICAgcmV0dXJuIFJCVHJlZS5zaW5nbGVfcm90YXRlKHJvb3QsIGRpcik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFJCVHJlZTtcclxufShUcmVlQmFzZSkpO1xyXG5leHBvcnRzLlJCVHJlZSA9IFJCVHJlZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmJ0cmVlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgdnBzY18xID0gcmVxdWlyZShcIi4vdnBzY1wiKTtcclxudmFyIHJidHJlZV8xID0gcmVxdWlyZShcIi4vcmJ0cmVlXCIpO1xyXG5mdW5jdGlvbiBjb21wdXRlR3JvdXBCb3VuZHMoZykge1xyXG4gICAgZy5ib3VuZHMgPSB0eXBlb2YgZy5sZWF2ZXMgIT09IFwidW5kZWZpbmVkXCIgP1xyXG4gICAgICAgIGcubGVhdmVzLnJlZHVjZShmdW5jdGlvbiAociwgYykgeyByZXR1cm4gYy5ib3VuZHMudW5pb24ocik7IH0sIFJlY3RhbmdsZS5lbXB0eSgpKSA6XHJcbiAgICAgICAgUmVjdGFuZ2xlLmVtcHR5KCk7XHJcbiAgICBpZiAodHlwZW9mIGcuZ3JvdXBzICE9PSBcInVuZGVmaW5lZFwiKVxyXG4gICAgICAgIGcuYm91bmRzID0gZy5ncm91cHMucmVkdWNlKGZ1bmN0aW9uIChyLCBjKSB7IHJldHVybiBjb21wdXRlR3JvdXBCb3VuZHMoYykudW5pb24ocik7IH0sIGcuYm91bmRzKTtcclxuICAgIGcuYm91bmRzID0gZy5ib3VuZHMuaW5mbGF0ZShnLnBhZGRpbmcpO1xyXG4gICAgcmV0dXJuIGcuYm91bmRzO1xyXG59XHJcbmV4cG9ydHMuY29tcHV0ZUdyb3VwQm91bmRzID0gY29tcHV0ZUdyb3VwQm91bmRzO1xyXG52YXIgUmVjdGFuZ2xlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJlY3RhbmdsZSh4LCBYLCB5LCBZKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLlggPSBYO1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5ZID0gWTtcclxuICAgIH1cclxuICAgIFJlY3RhbmdsZS5lbXB0eSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBSZWN0YW5nbGUoTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTsgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUuY3ggPSBmdW5jdGlvbiAoKSB7IHJldHVybiAodGhpcy54ICsgdGhpcy5YKSAvIDI7IH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLmN5ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKHRoaXMueSArIHRoaXMuWSkgLyAyOyB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5vdmVybGFwWCA9IGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgdmFyIHV4ID0gdGhpcy5jeCgpLCB2eCA9IHIuY3goKTtcclxuICAgICAgICBpZiAodXggPD0gdnggJiYgci54IDwgdGhpcy5YKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5YIC0gci54O1xyXG4gICAgICAgIGlmICh2eCA8PSB1eCAmJiB0aGlzLnggPCByLlgpXHJcbiAgICAgICAgICAgIHJldHVybiByLlggLSB0aGlzLng7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5vdmVybGFwWSA9IGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgdmFyIHV5ID0gdGhpcy5jeSgpLCB2eSA9IHIuY3koKTtcclxuICAgICAgICBpZiAodXkgPD0gdnkgJiYgci55IDwgdGhpcy5ZKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ZIC0gci55O1xyXG4gICAgICAgIGlmICh2eSA8PSB1eSAmJiB0aGlzLnkgPCByLlkpXHJcbiAgICAgICAgICAgIHJldHVybiByLlkgLSB0aGlzLnk7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5zZXRYQ2VudHJlID0gZnVuY3Rpb24gKGN4KSB7XHJcbiAgICAgICAgdmFyIGR4ID0gY3ggLSB0aGlzLmN4KCk7XHJcbiAgICAgICAgdGhpcy54ICs9IGR4O1xyXG4gICAgICAgIHRoaXMuWCArPSBkeDtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLnNldFlDZW50cmUgPSBmdW5jdGlvbiAoY3kpIHtcclxuICAgICAgICB2YXIgZHkgPSBjeSAtIHRoaXMuY3koKTtcclxuICAgICAgICB0aGlzLnkgKz0gZHk7XHJcbiAgICAgICAgdGhpcy5ZICs9IGR5O1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUud2lkdGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuWCAtIHRoaXMueDtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLmhlaWdodCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ZIC0gdGhpcy55O1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUudW5pb24gPSBmdW5jdGlvbiAocikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKE1hdGgubWluKHRoaXMueCwgci54KSwgTWF0aC5tYXgodGhpcy5YLCByLlgpLCBNYXRoLm1pbih0aGlzLnksIHIueSksIE1hdGgubWF4KHRoaXMuWSwgci5ZKSk7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5saW5lSW50ZXJzZWN0aW9ucyA9IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Mikge1xyXG4gICAgICAgIHZhciBzaWRlcyA9IFtbdGhpcy54LCB0aGlzLnksIHRoaXMuWCwgdGhpcy55XSxcclxuICAgICAgICAgICAgW3RoaXMuWCwgdGhpcy55LCB0aGlzLlgsIHRoaXMuWV0sXHJcbiAgICAgICAgICAgIFt0aGlzLlgsIHRoaXMuWSwgdGhpcy54LCB0aGlzLlldLFxyXG4gICAgICAgICAgICBbdGhpcy54LCB0aGlzLlksIHRoaXMueCwgdGhpcy55XV07XHJcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbnMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgciA9IFJlY3RhbmdsZS5saW5lSW50ZXJzZWN0aW9uKHgxLCB5MSwgeDIsIHkyLCBzaWRlc1tpXVswXSwgc2lkZXNbaV1bMV0sIHNpZGVzW2ldWzJdLCBzaWRlc1tpXVszXSk7XHJcbiAgICAgICAgICAgIGlmIChyICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKHsgeDogci54LCB5OiByLnkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUucmF5SW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHgyLCB5Mikge1xyXG4gICAgICAgIHZhciBpbnRzID0gdGhpcy5saW5lSW50ZXJzZWN0aW9ucyh0aGlzLmN4KCksIHRoaXMuY3koKSwgeDIsIHkyKTtcclxuICAgICAgICByZXR1cm4gaW50cy5sZW5ndGggPiAwID8gaW50c1swXSA6IG51bGw7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS52ZXJ0aWNlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICB7IHg6IHRoaXMueCwgeTogdGhpcy55IH0sXHJcbiAgICAgICAgICAgIHsgeDogdGhpcy5YLCB5OiB0aGlzLnkgfSxcclxuICAgICAgICAgICAgeyB4OiB0aGlzLlgsIHk6IHRoaXMuWSB9LFxyXG4gICAgICAgICAgICB7IHg6IHRoaXMueCwgeTogdGhpcy5ZIH0sXHJcbiAgICAgICAgICAgIHsgeDogdGhpcy54LCB5OiB0aGlzLnkgfVxyXG4gICAgICAgIF07XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLmxpbmVJbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0KSB7XHJcbiAgICAgICAgdmFyIGR4MTIgPSB4MiAtIHgxLCBkeDM0ID0geDQgLSB4MywgZHkxMiA9IHkyIC0geTEsIGR5MzQgPSB5NCAtIHkzLCBkZW5vbWluYXRvciA9IGR5MzQgKiBkeDEyIC0gZHgzNCAqIGR5MTI7XHJcbiAgICAgICAgaWYgKGRlbm9taW5hdG9yID09IDApXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIHZhciBkeDMxID0geDEgLSB4MywgZHkzMSA9IHkxIC0geTMsIG51bWEgPSBkeDM0ICogZHkzMSAtIGR5MzQgKiBkeDMxLCBhID0gbnVtYSAvIGRlbm9taW5hdG9yLCBudW1iID0gZHgxMiAqIGR5MzEgLSBkeTEyICogZHgzMSwgYiA9IG51bWIgLyBkZW5vbWluYXRvcjtcclxuICAgICAgICBpZiAoYSA+PSAwICYmIGEgPD0gMSAmJiBiID49IDAgJiYgYiA8PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB4OiB4MSArIGEgKiBkeDEyLFxyXG4gICAgICAgICAgICAgICAgeTogeTEgKyBhICogZHkxMlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLmluZmxhdGUgPSBmdW5jdGlvbiAocGFkKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZWN0YW5nbGUodGhpcy54IC0gcGFkLCB0aGlzLlggKyBwYWQsIHRoaXMueSAtIHBhZCwgdGhpcy5ZICsgcGFkKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUmVjdGFuZ2xlO1xyXG59KCkpO1xyXG5leHBvcnRzLlJlY3RhbmdsZSA9IFJlY3RhbmdsZTtcclxuZnVuY3Rpb24gbWFrZUVkZ2VCZXR3ZWVuKHNvdXJjZSwgdGFyZ2V0LCBhaCkge1xyXG4gICAgdmFyIHNpID0gc291cmNlLnJheUludGVyc2VjdGlvbih0YXJnZXQuY3goKSwgdGFyZ2V0LmN5KCkpIHx8IHsgeDogc291cmNlLmN4KCksIHk6IHNvdXJjZS5jeSgpIH0sIHRpID0gdGFyZ2V0LnJheUludGVyc2VjdGlvbihzb3VyY2UuY3goKSwgc291cmNlLmN5KCkpIHx8IHsgeDogdGFyZ2V0LmN4KCksIHk6IHRhcmdldC5jeSgpIH0sIGR4ID0gdGkueCAtIHNpLngsIGR5ID0gdGkueSAtIHNpLnksIGwgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpLCBhbCA9IGwgLSBhaDtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc291cmNlSW50ZXJzZWN0aW9uOiBzaSxcclxuICAgICAgICB0YXJnZXRJbnRlcnNlY3Rpb246IHRpLFxyXG4gICAgICAgIGFycm93U3RhcnQ6IHsgeDogc2kueCArIGFsICogZHggLyBsLCB5OiBzaS55ICsgYWwgKiBkeSAvIGwgfVxyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLm1ha2VFZGdlQmV0d2VlbiA9IG1ha2VFZGdlQmV0d2VlbjtcclxuZnVuY3Rpb24gbWFrZUVkZ2VUbyhzLCB0YXJnZXQsIGFoKSB7XHJcbiAgICB2YXIgdGkgPSB0YXJnZXQucmF5SW50ZXJzZWN0aW9uKHMueCwgcy55KTtcclxuICAgIGlmICghdGkpXHJcbiAgICAgICAgdGkgPSB7IHg6IHRhcmdldC5jeCgpLCB5OiB0YXJnZXQuY3koKSB9O1xyXG4gICAgdmFyIGR4ID0gdGkueCAtIHMueCwgZHkgPSB0aS55IC0gcy55LCBsID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuICAgIHJldHVybiB7IHg6IHRpLnggLSBhaCAqIGR4IC8gbCwgeTogdGkueSAtIGFoICogZHkgLyBsIH07XHJcbn1cclxuZXhwb3J0cy5tYWtlRWRnZVRvID0gbWFrZUVkZ2VUbztcclxudmFyIE5vZGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm9kZSh2LCByLCBwb3MpIHtcclxuICAgICAgICB0aGlzLnYgPSB2O1xyXG4gICAgICAgIHRoaXMuciA9IHI7XHJcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XHJcbiAgICAgICAgdGhpcy5wcmV2ID0gbWFrZVJCVHJlZSgpO1xyXG4gICAgICAgIHRoaXMubmV4dCA9IG1ha2VSQlRyZWUoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBOb2RlO1xyXG59KCkpO1xyXG52YXIgRXZlbnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRXZlbnQoaXNPcGVuLCB2LCBwb3MpIHtcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IGlzT3BlbjtcclxuICAgICAgICB0aGlzLnYgPSB2O1xyXG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEV2ZW50O1xyXG59KCkpO1xyXG5mdW5jdGlvbiBjb21wYXJlRXZlbnRzKGEsIGIpIHtcclxuICAgIGlmIChhLnBvcyA+IGIucG9zKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9XHJcbiAgICBpZiAoYS5wb3MgPCBiLnBvcykge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIGlmIChhLmlzT3Blbikge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIGlmIChiLmlzT3Blbikge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDA7XHJcbn1cclxuZnVuY3Rpb24gbWFrZVJCVHJlZSgpIHtcclxuICAgIHJldHVybiBuZXcgcmJ0cmVlXzEuUkJUcmVlKGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLnBvcyAtIGIucG9zOyB9KTtcclxufVxyXG52YXIgeFJlY3QgPSB7XHJcbiAgICBnZXRDZW50cmU6IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLmN4KCk7IH0sXHJcbiAgICBnZXRPcGVuOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci55OyB9LFxyXG4gICAgZ2V0Q2xvc2U6IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLlk7IH0sXHJcbiAgICBnZXRTaXplOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci53aWR0aCgpOyB9LFxyXG4gICAgbWFrZVJlY3Q6IGZ1bmN0aW9uIChvcGVuLCBjbG9zZSwgY2VudGVyLCBzaXplKSB7IHJldHVybiBuZXcgUmVjdGFuZ2xlKGNlbnRlciAtIHNpemUgLyAyLCBjZW50ZXIgKyBzaXplIC8gMiwgb3BlbiwgY2xvc2UpOyB9LFxyXG4gICAgZmluZE5laWdoYm91cnM6IGZpbmRYTmVpZ2hib3Vyc1xyXG59O1xyXG52YXIgeVJlY3QgPSB7XHJcbiAgICBnZXRDZW50cmU6IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLmN5KCk7IH0sXHJcbiAgICBnZXRPcGVuOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci54OyB9LFxyXG4gICAgZ2V0Q2xvc2U6IGZ1bmN0aW9uIChyKSB7IHJldHVybiByLlg7IH0sXHJcbiAgICBnZXRTaXplOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci5oZWlnaHQoKTsgfSxcclxuICAgIG1ha2VSZWN0OiBmdW5jdGlvbiAob3BlbiwgY2xvc2UsIGNlbnRlciwgc2l6ZSkgeyByZXR1cm4gbmV3IFJlY3RhbmdsZShvcGVuLCBjbG9zZSwgY2VudGVyIC0gc2l6ZSAvIDIsIGNlbnRlciArIHNpemUgLyAyKTsgfSxcclxuICAgIGZpbmROZWlnaGJvdXJzOiBmaW5kWU5laWdoYm91cnNcclxufTtcclxuZnVuY3Rpb24gZ2VuZXJhdGVHcm91cENvbnN0cmFpbnRzKHJvb3QsIGYsIG1pblNlcCwgaXNDb250YWluZWQpIHtcclxuICAgIGlmIChpc0NvbnRhaW5lZCA9PT0gdm9pZCAwKSB7IGlzQ29udGFpbmVkID0gZmFsc2U7IH1cclxuICAgIHZhciBwYWRkaW5nID0gcm9vdC5wYWRkaW5nLCBnbiA9IHR5cGVvZiByb290Lmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcgPyByb290Lmdyb3Vwcy5sZW5ndGggOiAwLCBsbiA9IHR5cGVvZiByb290LmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcgPyByb290LmxlYXZlcy5sZW5ndGggOiAwLCBjaGlsZENvbnN0cmFpbnRzID0gIWduID8gW11cclxuICAgICAgICA6IHJvb3QuZ3JvdXBzLnJlZHVjZShmdW5jdGlvbiAoY2NzLCBnKSB7IHJldHVybiBjY3MuY29uY2F0KGdlbmVyYXRlR3JvdXBDb25zdHJhaW50cyhnLCBmLCBtaW5TZXAsIHRydWUpKTsgfSwgW10pLCBuID0gKGlzQ29udGFpbmVkID8gMiA6IDApICsgbG4gKyBnbiwgdnMgPSBuZXcgQXJyYXkobiksIHJzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgYWRkID0gZnVuY3Rpb24gKHIsIHYpIHsgcnNbaV0gPSByOyB2c1tpKytdID0gdjsgfTtcclxuICAgIGlmIChpc0NvbnRhaW5lZCkge1xyXG4gICAgICAgIHZhciBiID0gcm9vdC5ib3VuZHMsIGMgPSBmLmdldENlbnRyZShiKSwgcyA9IGYuZ2V0U2l6ZShiKSAvIDIsIG9wZW4gPSBmLmdldE9wZW4oYiksIGNsb3NlID0gZi5nZXRDbG9zZShiKSwgbWluID0gYyAtIHMgKyBwYWRkaW5nIC8gMiwgbWF4ID0gYyArIHMgLSBwYWRkaW5nIC8gMjtcclxuICAgICAgICByb290Lm1pblZhci5kZXNpcmVkUG9zaXRpb24gPSBtaW47XHJcbiAgICAgICAgYWRkKGYubWFrZVJlY3Qob3BlbiwgY2xvc2UsIG1pbiwgcGFkZGluZyksIHJvb3QubWluVmFyKTtcclxuICAgICAgICByb290Lm1heFZhci5kZXNpcmVkUG9zaXRpb24gPSBtYXg7XHJcbiAgICAgICAgYWRkKGYubWFrZVJlY3Qob3BlbiwgY2xvc2UsIG1heCwgcGFkZGluZyksIHJvb3QubWF4VmFyKTtcclxuICAgIH1cclxuICAgIGlmIChsbilcclxuICAgICAgICByb290LmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uIChsKSB7IHJldHVybiBhZGQobC5ib3VuZHMsIGwudmFyaWFibGUpOyB9KTtcclxuICAgIGlmIChnbilcclxuICAgICAgICByb290Lmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgIHZhciBiID0gZy5ib3VuZHM7XHJcbiAgICAgICAgICAgIGFkZChmLm1ha2VSZWN0KGYuZ2V0T3BlbihiKSwgZi5nZXRDbG9zZShiKSwgZi5nZXRDZW50cmUoYiksIGYuZ2V0U2l6ZShiKSksIGcubWluVmFyKTtcclxuICAgICAgICB9KTtcclxuICAgIHZhciBjcyA9IGdlbmVyYXRlQ29uc3RyYWludHMocnMsIHZzLCBmLCBtaW5TZXApO1xyXG4gICAgaWYgKGduKSB7XHJcbiAgICAgICAgdnMuZm9yRWFjaChmdW5jdGlvbiAodikgeyB2LmNPdXQgPSBbXSwgdi5jSW4gPSBbXTsgfSk7XHJcbiAgICAgICAgY3MuZm9yRWFjaChmdW5jdGlvbiAoYykgeyBjLmxlZnQuY091dC5wdXNoKGMpLCBjLnJpZ2h0LmNJbi5wdXNoKGMpOyB9KTtcclxuICAgICAgICByb290Lmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgIHZhciBnYXBBZGp1c3RtZW50ID0gKGcucGFkZGluZyAtIGYuZ2V0U2l6ZShnLmJvdW5kcykpIC8gMjtcclxuICAgICAgICAgICAgZy5taW5WYXIuY0luLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMuZ2FwICs9IGdhcEFkanVzdG1lbnQ7IH0pO1xyXG4gICAgICAgICAgICBnLm1pblZhci5jT3V0LmZvckVhY2goZnVuY3Rpb24gKGMpIHsgYy5sZWZ0ID0gZy5tYXhWYXI7IGMuZ2FwICs9IGdhcEFkanVzdG1lbnQ7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNoaWxkQ29uc3RyYWludHMuY29uY2F0KGNzKTtcclxufVxyXG5mdW5jdGlvbiBnZW5lcmF0ZUNvbnN0cmFpbnRzKHJzLCB2YXJzLCByZWN0LCBtaW5TZXApIHtcclxuICAgIHZhciBpLCBuID0gcnMubGVuZ3RoO1xyXG4gICAgdmFyIE4gPSAyICogbjtcclxuICAgIGNvbnNvbGUuYXNzZXJ0KHZhcnMubGVuZ3RoID49IG4pO1xyXG4gICAgdmFyIGV2ZW50cyA9IG5ldyBBcnJheShOKTtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICB2YXIgciA9IHJzW2ldO1xyXG4gICAgICAgIHZhciB2ID0gbmV3IE5vZGUodmFyc1tpXSwgciwgcmVjdC5nZXRDZW50cmUocikpO1xyXG4gICAgICAgIGV2ZW50c1tpXSA9IG5ldyBFdmVudCh0cnVlLCB2LCByZWN0LmdldE9wZW4ocikpO1xyXG4gICAgICAgIGV2ZW50c1tpICsgbl0gPSBuZXcgRXZlbnQoZmFsc2UsIHYsIHJlY3QuZ2V0Q2xvc2UocikpO1xyXG4gICAgfVxyXG4gICAgZXZlbnRzLnNvcnQoY29tcGFyZUV2ZW50cyk7XHJcbiAgICB2YXIgY3MgPSBuZXcgQXJyYXkoKTtcclxuICAgIHZhciBzY2FubGluZSA9IG1ha2VSQlRyZWUoKTtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBOOyArK2kpIHtcclxuICAgICAgICB2YXIgZSA9IGV2ZW50c1tpXTtcclxuICAgICAgICB2YXIgdiA9IGUudjtcclxuICAgICAgICBpZiAoZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgc2NhbmxpbmUuaW5zZXJ0KHYpO1xyXG4gICAgICAgICAgICByZWN0LmZpbmROZWlnaGJvdXJzKHYsIHNjYW5saW5lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNjYW5saW5lLnJlbW92ZSh2KTtcclxuICAgICAgICAgICAgdmFyIG1ha2VDb25zdHJhaW50ID0gZnVuY3Rpb24gKGwsIHIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZXAgPSAocmVjdC5nZXRTaXplKGwucikgKyByZWN0LmdldFNpemUoci5yKSkgLyAyICsgbWluU2VwO1xyXG4gICAgICAgICAgICAgICAgY3MucHVzaChuZXcgdnBzY18xLkNvbnN0cmFpbnQobC52LCByLnYsIHNlcCkpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB2YXIgdmlzaXROZWlnaGJvdXJzID0gZnVuY3Rpb24gKGZvcndhcmQsIHJldmVyc2UsIG1rY29uKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdSwgaXQgPSB2W2ZvcndhcmRdLml0ZXJhdG9yKCk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoKHUgPSBpdFtmb3J3YXJkXSgpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1rY29uKHUsIHYpO1xyXG4gICAgICAgICAgICAgICAgICAgIHVbcmV2ZXJzZV0ucmVtb3ZlKHYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB2aXNpdE5laWdoYm91cnMoXCJwcmV2XCIsIFwibmV4dFwiLCBmdW5jdGlvbiAodSwgdikgeyByZXR1cm4gbWFrZUNvbnN0cmFpbnQodSwgdik7IH0pO1xyXG4gICAgICAgICAgICB2aXNpdE5laWdoYm91cnMoXCJuZXh0XCIsIFwicHJldlwiLCBmdW5jdGlvbiAodSwgdikgeyByZXR1cm4gbWFrZUNvbnN0cmFpbnQodiwgdSk7IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnNvbGUuYXNzZXJ0KHNjYW5saW5lLnNpemUgPT09IDApO1xyXG4gICAgcmV0dXJuIGNzO1xyXG59XHJcbmZ1bmN0aW9uIGZpbmRYTmVpZ2hib3Vycyh2LCBzY2FubGluZSkge1xyXG4gICAgdmFyIGYgPSBmdW5jdGlvbiAoZm9yd2FyZCwgcmV2ZXJzZSkge1xyXG4gICAgICAgIHZhciBpdCA9IHNjYW5saW5lLmZpbmRJdGVyKHYpO1xyXG4gICAgICAgIHZhciB1O1xyXG4gICAgICAgIHdoaWxlICgodSA9IGl0W2ZvcndhcmRdKCkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciB1b3ZlcnZYID0gdS5yLm92ZXJsYXBYKHYucik7XHJcbiAgICAgICAgICAgIGlmICh1b3ZlcnZYIDw9IDAgfHwgdW92ZXJ2WCA8PSB1LnIub3ZlcmxhcFkodi5yKSkge1xyXG4gICAgICAgICAgICAgICAgdltmb3J3YXJkXS5pbnNlcnQodSk7XHJcbiAgICAgICAgICAgICAgICB1W3JldmVyc2VdLmluc2VydCh2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodW92ZXJ2WCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBmKFwibmV4dFwiLCBcInByZXZcIik7XHJcbiAgICBmKFwicHJldlwiLCBcIm5leHRcIik7XHJcbn1cclxuZnVuY3Rpb24gZmluZFlOZWlnaGJvdXJzKHYsIHNjYW5saW5lKSB7XHJcbiAgICB2YXIgZiA9IGZ1bmN0aW9uIChmb3J3YXJkLCByZXZlcnNlKSB7XHJcbiAgICAgICAgdmFyIHUgPSBzY2FubGluZS5maW5kSXRlcih2KVtmb3J3YXJkXSgpO1xyXG4gICAgICAgIGlmICh1ICE9PSBudWxsICYmIHUuci5vdmVybGFwWCh2LnIpID4gMCkge1xyXG4gICAgICAgICAgICB2W2ZvcndhcmRdLmluc2VydCh1KTtcclxuICAgICAgICAgICAgdVtyZXZlcnNlXS5pbnNlcnQodik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGYoXCJuZXh0XCIsIFwicHJldlwiKTtcclxuICAgIGYoXCJwcmV2XCIsIFwibmV4dFwiKTtcclxufVxyXG5mdW5jdGlvbiBnZW5lcmF0ZVhDb25zdHJhaW50cyhycywgdmFycykge1xyXG4gICAgcmV0dXJuIGdlbmVyYXRlQ29uc3RyYWludHMocnMsIHZhcnMsIHhSZWN0LCAxZS02KTtcclxufVxyXG5leHBvcnRzLmdlbmVyYXRlWENvbnN0cmFpbnRzID0gZ2VuZXJhdGVYQ29uc3RyYWludHM7XHJcbmZ1bmN0aW9uIGdlbmVyYXRlWUNvbnN0cmFpbnRzKHJzLCB2YXJzKSB7XHJcbiAgICByZXR1cm4gZ2VuZXJhdGVDb25zdHJhaW50cyhycywgdmFycywgeVJlY3QsIDFlLTYpO1xyXG59XHJcbmV4cG9ydHMuZ2VuZXJhdGVZQ29uc3RyYWludHMgPSBnZW5lcmF0ZVlDb25zdHJhaW50cztcclxuZnVuY3Rpb24gZ2VuZXJhdGVYR3JvdXBDb25zdHJhaW50cyhyb290KSB7XHJcbiAgICByZXR1cm4gZ2VuZXJhdGVHcm91cENvbnN0cmFpbnRzKHJvb3QsIHhSZWN0LCAxZS02KTtcclxufVxyXG5leHBvcnRzLmdlbmVyYXRlWEdyb3VwQ29uc3RyYWludHMgPSBnZW5lcmF0ZVhHcm91cENvbnN0cmFpbnRzO1xyXG5mdW5jdGlvbiBnZW5lcmF0ZVlHcm91cENvbnN0cmFpbnRzKHJvb3QpIHtcclxuICAgIHJldHVybiBnZW5lcmF0ZUdyb3VwQ29uc3RyYWludHMocm9vdCwgeVJlY3QsIDFlLTYpO1xyXG59XHJcbmV4cG9ydHMuZ2VuZXJhdGVZR3JvdXBDb25zdHJhaW50cyA9IGdlbmVyYXRlWUdyb3VwQ29uc3RyYWludHM7XHJcbmZ1bmN0aW9uIHJlbW92ZU92ZXJsYXBzKHJzKSB7XHJcbiAgICB2YXIgdnMgPSBycy5tYXAoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIG5ldyB2cHNjXzEuVmFyaWFibGUoci5jeCgpKTsgfSk7XHJcbiAgICB2YXIgY3MgPSBnZW5lcmF0ZVhDb25zdHJhaW50cyhycywgdnMpO1xyXG4gICAgdmFyIHNvbHZlciA9IG5ldyB2cHNjXzEuU29sdmVyKHZzLCBjcyk7XHJcbiAgICBzb2x2ZXIuc29sdmUoKTtcclxuICAgIHZzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIHJzW2ldLnNldFhDZW50cmUodi5wb3NpdGlvbigpKTsgfSk7XHJcbiAgICB2cyA9IHJzLm1hcChmdW5jdGlvbiAocikgeyByZXR1cm4gbmV3IHZwc2NfMS5WYXJpYWJsZShyLmN5KCkpOyB9KTtcclxuICAgIGNzID0gZ2VuZXJhdGVZQ29uc3RyYWludHMocnMsIHZzKTtcclxuICAgIHNvbHZlciA9IG5ldyB2cHNjXzEuU29sdmVyKHZzLCBjcyk7XHJcbiAgICBzb2x2ZXIuc29sdmUoKTtcclxuICAgIHZzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIHJzW2ldLnNldFlDZW50cmUodi5wb3NpdGlvbigpKTsgfSk7XHJcbn1cclxuZXhwb3J0cy5yZW1vdmVPdmVybGFwcyA9IHJlbW92ZU92ZXJsYXBzO1xyXG52YXIgSW5kZXhlZFZhcmlhYmxlID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhJbmRleGVkVmFyaWFibGUsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBJbmRleGVkVmFyaWFibGUoaW5kZXgsIHcpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCAwLCB3KSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEluZGV4ZWRWYXJpYWJsZTtcclxufSh2cHNjXzEuVmFyaWFibGUpKTtcclxuZXhwb3J0cy5JbmRleGVkVmFyaWFibGUgPSBJbmRleGVkVmFyaWFibGU7XHJcbnZhciBQcm9qZWN0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFByb2plY3Rpb24obm9kZXMsIGdyb3Vwcywgcm9vdEdyb3VwLCBjb25zdHJhaW50cywgYXZvaWRPdmVybGFwcykge1xyXG4gICAgICAgIGlmIChyb290R3JvdXAgPT09IHZvaWQgMCkgeyByb290R3JvdXAgPSBudWxsOyB9XHJcbiAgICAgICAgaWYgKGNvbnN0cmFpbnRzID09PSB2b2lkIDApIHsgY29uc3RyYWludHMgPSBudWxsOyB9XHJcbiAgICAgICAgaWYgKGF2b2lkT3ZlcmxhcHMgPT09IHZvaWQgMCkgeyBhdm9pZE92ZXJsYXBzID0gZmFsc2U7IH1cclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcclxuICAgICAgICB0aGlzLmdyb3VwcyA9IGdyb3VwcztcclxuICAgICAgICB0aGlzLnJvb3RHcm91cCA9IHJvb3RHcm91cDtcclxuICAgICAgICB0aGlzLmF2b2lkT3ZlcmxhcHMgPSBhdm9pZE92ZXJsYXBzO1xyXG4gICAgICAgIHRoaXMudmFyaWFibGVzID0gbm9kZXMubWFwKGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2LnZhcmlhYmxlID0gbmV3IEluZGV4ZWRWYXJpYWJsZShpLCAxKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoY29uc3RyYWludHMpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29uc3RyYWludHMoY29uc3RyYWludHMpO1xyXG4gICAgICAgIGlmIChhdm9pZE92ZXJsYXBzICYmIHJvb3RHcm91cCAmJiB0eXBlb2Ygcm9vdEdyb3VwLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF2LndpZHRoIHx8ICF2LmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYuYm91bmRzID0gbmV3IFJlY3RhbmdsZSh2LngsIHYueCwgdi55LCB2LnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB3MiA9IHYud2lkdGggLyAyLCBoMiA9IHYuaGVpZ2h0IC8gMjtcclxuICAgICAgICAgICAgICAgIHYuYm91bmRzID0gbmV3IFJlY3RhbmdsZSh2LnggLSB3Miwgdi54ICsgdzIsIHYueSAtIGgyLCB2LnkgKyBoMik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb21wdXRlR3JvdXBCb3VuZHMocm9vdEdyb3VwKTtcclxuICAgICAgICAgICAgdmFyIGkgPSBub2Rlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy52YXJpYWJsZXNbaV0gPSBnLm1pblZhciA9IG5ldyBJbmRleGVkVmFyaWFibGUoaSsrLCB0eXBlb2YgZy5zdGlmZm5lc3MgIT09IFwidW5kZWZpbmVkXCIgPyBnLnN0aWZmbmVzcyA6IDAuMDEpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMudmFyaWFibGVzW2ldID0gZy5tYXhWYXIgPSBuZXcgSW5kZXhlZFZhcmlhYmxlKGkrKywgdHlwZW9mIGcuc3RpZmZuZXNzICE9PSBcInVuZGVmaW5lZFwiID8gZy5zdGlmZm5lc3MgOiAwLjAxKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUuY3JlYXRlU2VwYXJhdGlvbiA9IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB2cHNjXzEuQ29uc3RyYWludCh0aGlzLm5vZGVzW2MubGVmdF0udmFyaWFibGUsIHRoaXMubm9kZXNbYy5yaWdodF0udmFyaWFibGUsIGMuZ2FwLCB0eXBlb2YgYy5lcXVhbGl0eSAhPT0gXCJ1bmRlZmluZWRcIiA/IGMuZXF1YWxpdHkgOiBmYWxzZSk7XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUubWFrZUZlYXNpYmxlID0gZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy5hdm9pZE92ZXJsYXBzKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyIGF4aXMgPSAneCcsIGRpbSA9ICd3aWR0aCc7XHJcbiAgICAgICAgaWYgKGMuYXhpcyA9PT0gJ3gnKVxyXG4gICAgICAgICAgICBheGlzID0gJ3knLCBkaW0gPSAnaGVpZ2h0JztcclxuICAgICAgICB2YXIgdnMgPSBjLm9mZnNldHMubWFwKGZ1bmN0aW9uIChvKSB7IHJldHVybiBfdGhpcy5ub2Rlc1tvLm5vZGVdOyB9KS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhW2F4aXNdIC0gYltheGlzXTsgfSk7XHJcbiAgICAgICAgdmFyIHAgPSBudWxsO1xyXG4gICAgICAgIHZzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgaWYgKHApIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXh0UG9zID0gcFtheGlzXSArIHBbZGltXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXh0UG9zID4gdltheGlzXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZbYXhpc10gPSBuZXh0UG9zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHAgPSB2O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUFsaWdubWVudCA9IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgdSA9IHRoaXMubm9kZXNbYy5vZmZzZXRzWzBdLm5vZGVdLnZhcmlhYmxlO1xyXG4gICAgICAgIHRoaXMubWFrZUZlYXNpYmxlKGMpO1xyXG4gICAgICAgIHZhciBjcyA9IGMuYXhpcyA9PT0gJ3gnID8gdGhpcy54Q29uc3RyYWludHMgOiB0aGlzLnlDb25zdHJhaW50cztcclxuICAgICAgICBjLm9mZnNldHMuc2xpY2UoMSkuZm9yRWFjaChmdW5jdGlvbiAobykge1xyXG4gICAgICAgICAgICB2YXIgdiA9IF90aGlzLm5vZGVzW28ubm9kZV0udmFyaWFibGU7XHJcbiAgICAgICAgICAgIGNzLnB1c2gobmV3IHZwc2NfMS5Db25zdHJhaW50KHUsIHYsIG8ub2Zmc2V0LCB0cnVlKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQ29uc3RyYWludHMgPSBmdW5jdGlvbiAoY29uc3RyYWludHMpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBpc1NlcCA9IGZ1bmN0aW9uIChjKSB7IHJldHVybiB0eXBlb2YgYy50eXBlID09PSAndW5kZWZpbmVkJyB8fCBjLnR5cGUgPT09ICdzZXBhcmF0aW9uJzsgfTtcclxuICAgICAgICB0aGlzLnhDb25zdHJhaW50cyA9IGNvbnN0cmFpbnRzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMuYXhpcyA9PT0gXCJ4XCIgJiYgaXNTZXAoYyk7IH0pXHJcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIF90aGlzLmNyZWF0ZVNlcGFyYXRpb24oYyk7IH0pO1xyXG4gICAgICAgIHRoaXMueUNvbnN0cmFpbnRzID0gY29uc3RyYWludHNcclxuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYy5heGlzID09PSBcInlcIiAmJiBpc1NlcChjKTsgfSlcclxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbiAoYykgeyByZXR1cm4gX3RoaXMuY3JlYXRlU2VwYXJhdGlvbihjKTsgfSk7XHJcbiAgICAgICAgY29uc3RyYWludHNcclxuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYy50eXBlID09PSAnYWxpZ25tZW50JzsgfSlcclxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIF90aGlzLmNyZWF0ZUFsaWdubWVudChjKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUuc2V0dXBWYXJpYWJsZXNBbmRCb3VuZHMgPSBmdW5jdGlvbiAoeDAsIHkwLCBkZXNpcmVkLCBnZXREZXNpcmVkKSB7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgICAgICAgIGlmICh2LmZpeGVkKSB7XHJcbiAgICAgICAgICAgICAgICB2LnZhcmlhYmxlLndlaWdodCA9IHYuZml4ZWRXZWlnaHQgPyB2LmZpeGVkV2VpZ2h0IDogMTAwMDtcclxuICAgICAgICAgICAgICAgIGRlc2lyZWRbaV0gPSBnZXREZXNpcmVkKHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdi52YXJpYWJsZS53ZWlnaHQgPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB3ID0gKHYud2lkdGggfHwgMCkgLyAyLCBoID0gKHYuaGVpZ2h0IHx8IDApIC8gMjtcclxuICAgICAgICAgICAgdmFyIGl4ID0geDBbaV0sIGl5ID0geTBbaV07XHJcbiAgICAgICAgICAgIHYuYm91bmRzID0gbmV3IFJlY3RhbmdsZShpeCAtIHcsIGl4ICsgdywgaXkgLSBoLCBpeSArIGgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLnhQcm9qZWN0ID0gZnVuY3Rpb24gKHgwLCB5MCwgeCkge1xyXG4gICAgICAgIGlmICghdGhpcy5yb290R3JvdXAgJiYgISh0aGlzLmF2b2lkT3ZlcmxhcHMgfHwgdGhpcy54Q29uc3RyYWludHMpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5wcm9qZWN0KHgwLCB5MCwgeDAsIHgsIGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnB4OyB9LCB0aGlzLnhDb25zdHJhaW50cywgZ2VuZXJhdGVYR3JvdXBDb25zdHJhaW50cywgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYuYm91bmRzLnNldFhDZW50cmUoeFt2LnZhcmlhYmxlLmluZGV4XSA9IHYudmFyaWFibGUucG9zaXRpb24oKSk7IH0sIGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgIHZhciB4bWluID0geFtnLm1pblZhci5pbmRleF0gPSBnLm1pblZhci5wb3NpdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgeG1heCA9IHhbZy5tYXhWYXIuaW5kZXhdID0gZy5tYXhWYXIucG9zaXRpb24oKTtcclxuICAgICAgICAgICAgdmFyIHAyID0gZy5wYWRkaW5nIC8gMjtcclxuICAgICAgICAgICAgZy5ib3VuZHMueCA9IHhtaW4gLSBwMjtcclxuICAgICAgICAgICAgZy5ib3VuZHMuWCA9IHhtYXggKyBwMjtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS55UHJvamVjdCA9IGZ1bmN0aW9uICh4MCwgeTAsIHkpIHtcclxuICAgICAgICBpZiAoIXRoaXMucm9vdEdyb3VwICYmICF0aGlzLnlDb25zdHJhaW50cylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMucHJvamVjdCh4MCwgeTAsIHkwLCB5LCBmdW5jdGlvbiAodikgeyByZXR1cm4gdi5weTsgfSwgdGhpcy55Q29uc3RyYWludHMsIGdlbmVyYXRlWUdyb3VwQ29uc3RyYWludHMsIGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LmJvdW5kcy5zZXRZQ2VudHJlKHlbdi52YXJpYWJsZS5pbmRleF0gPSB2LnZhcmlhYmxlLnBvc2l0aW9uKCkpOyB9LCBmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICB2YXIgeW1pbiA9IHlbZy5taW5WYXIuaW5kZXhdID0gZy5taW5WYXIucG9zaXRpb24oKTtcclxuICAgICAgICAgICAgdmFyIHltYXggPSB5W2cubWF4VmFyLmluZGV4XSA9IGcubWF4VmFyLnBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIHZhciBwMiA9IGcucGFkZGluZyAvIDI7XHJcbiAgICAgICAgICAgIGcuYm91bmRzLnkgPSB5bWluIC0gcDI7XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgZy5ib3VuZHMuWSA9IHltYXggKyBwMjtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5wcm9qZWN0RnVuY3Rpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgZnVuY3Rpb24gKHgwLCB5MCwgeCkgeyByZXR1cm4gX3RoaXMueFByb2plY3QoeDAsIHkwLCB4KTsgfSxcclxuICAgICAgICAgICAgZnVuY3Rpb24gKHgwLCB5MCwgeSkgeyByZXR1cm4gX3RoaXMueVByb2plY3QoeDAsIHkwLCB5KTsgfVxyXG4gICAgICAgIF07XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUucHJvamVjdCA9IGZ1bmN0aW9uICh4MCwgeTAsIHN0YXJ0LCBkZXNpcmVkLCBnZXREZXNpcmVkLCBjcywgZ2VuZXJhdGVDb25zdHJhaW50cywgdXBkYXRlTm9kZUJvdW5kcywgdXBkYXRlR3JvdXBCb3VuZHMpIHtcclxuICAgICAgICB0aGlzLnNldHVwVmFyaWFibGVzQW5kQm91bmRzKHgwLCB5MCwgZGVzaXJlZCwgZ2V0RGVzaXJlZCk7XHJcbiAgICAgICAgaWYgKHRoaXMucm9vdEdyb3VwICYmIHRoaXMuYXZvaWRPdmVybGFwcykge1xyXG4gICAgICAgICAgICBjb21wdXRlR3JvdXBCb3VuZHModGhpcy5yb290R3JvdXApO1xyXG4gICAgICAgICAgICBjcyA9IGNzLmNvbmNhdChnZW5lcmF0ZUNvbnN0cmFpbnRzKHRoaXMucm9vdEdyb3VwKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29sdmUodGhpcy52YXJpYWJsZXMsIGNzLCBzdGFydCwgZGVzaXJlZCk7XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKHVwZGF0ZU5vZGVCb3VuZHMpO1xyXG4gICAgICAgIGlmICh0aGlzLnJvb3RHcm91cCAmJiB0aGlzLmF2b2lkT3ZlcmxhcHMpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cHMuZm9yRWFjaCh1cGRhdGVHcm91cEJvdW5kcyk7XHJcbiAgICAgICAgICAgIGNvbXB1dGVHcm91cEJvdW5kcyh0aGlzLnJvb3RHcm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLnNvbHZlID0gZnVuY3Rpb24gKHZzLCBjcywgc3RhcnRpbmcsIGRlc2lyZWQpIHtcclxuICAgICAgICB2YXIgc29sdmVyID0gbmV3IHZwc2NfMS5Tb2x2ZXIodnMsIGNzKTtcclxuICAgICAgICBzb2x2ZXIuc2V0U3RhcnRpbmdQb3NpdGlvbnMoc3RhcnRpbmcpO1xyXG4gICAgICAgIHNvbHZlci5zZXREZXNpcmVkUG9zaXRpb25zKGRlc2lyZWQpO1xyXG4gICAgICAgIHNvbHZlci5zb2x2ZSgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQcm9qZWN0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLlByb2plY3Rpb24gPSBQcm9qZWN0aW9uO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWN0YW5nbGUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHBxdWV1ZV8xID0gcmVxdWlyZShcIi4vcHF1ZXVlXCIpO1xyXG52YXIgTmVpZ2hib3VyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5laWdoYm91cihpZCwgZGlzdGFuY2UpIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5laWdoYm91cjtcclxufSgpKTtcclxudmFyIE5vZGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm9kZShpZCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLm5laWdoYm91cnMgPSBbXTtcclxuICAgIH1cclxuICAgIHJldHVybiBOb2RlO1xyXG59KCkpO1xyXG52YXIgUXVldWVFbnRyeSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBRdWV1ZUVudHJ5KG5vZGUsIHByZXYsIGQpIHtcclxuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgICAgIHRoaXMucHJldiA9IHByZXY7XHJcbiAgICAgICAgdGhpcy5kID0gZDtcclxuICAgIH1cclxuICAgIHJldHVybiBRdWV1ZUVudHJ5O1xyXG59KCkpO1xyXG52YXIgQ2FsY3VsYXRvciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBDYWxjdWxhdG9yKG4sIGVzLCBnZXRTb3VyY2VJbmRleCwgZ2V0VGFyZ2V0SW5kZXgsIGdldExlbmd0aCkge1xyXG4gICAgICAgIHRoaXMubiA9IG47XHJcbiAgICAgICAgdGhpcy5lcyA9IGVzO1xyXG4gICAgICAgIHRoaXMubmVpZ2hib3VycyA9IG5ldyBBcnJheSh0aGlzLm4pO1xyXG4gICAgICAgIHZhciBpID0gdGhpcy5uO1xyXG4gICAgICAgIHdoaWxlIChpLS0pXHJcbiAgICAgICAgICAgIHRoaXMubmVpZ2hib3Vyc1tpXSA9IG5ldyBOb2RlKGkpO1xyXG4gICAgICAgIGkgPSB0aGlzLmVzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciBlID0gdGhpcy5lc1tpXTtcclxuICAgICAgICAgICAgdmFyIHUgPSBnZXRTb3VyY2VJbmRleChlKSwgdiA9IGdldFRhcmdldEluZGV4KGUpO1xyXG4gICAgICAgICAgICB2YXIgZCA9IGdldExlbmd0aChlKTtcclxuICAgICAgICAgICAgdGhpcy5uZWlnaGJvdXJzW3VdLm5laWdoYm91cnMucHVzaChuZXcgTmVpZ2hib3VyKHYsIGQpKTtcclxuICAgICAgICAgICAgdGhpcy5uZWlnaGJvdXJzW3ZdLm5laWdoYm91cnMucHVzaChuZXcgTmVpZ2hib3VyKHUsIGQpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5EaXN0YW5jZU1hdHJpeCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgRCA9IG5ldyBBcnJheSh0aGlzLm4pO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uOyArK2kpIHtcclxuICAgICAgICAgICAgRFtpXSA9IHRoaXMuZGlqa3N0cmFOZWlnaGJvdXJzKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRDtcclxuICAgIH07XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5EaXN0YW5jZXNGcm9tTm9kZSA9IGZ1bmN0aW9uIChzdGFydCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpamtzdHJhTmVpZ2hib3VycyhzdGFydCk7XHJcbiAgICB9O1xyXG4gICAgQ2FsY3VsYXRvci5wcm90b3R5cGUuUGF0aEZyb21Ob2RlVG9Ob2RlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kaWprc3RyYU5laWdoYm91cnMoc3RhcnQsIGVuZCk7XHJcbiAgICB9O1xyXG4gICAgQ2FsY3VsYXRvci5wcm90b3R5cGUuUGF0aEZyb21Ob2RlVG9Ob2RlV2l0aFByZXZDb3N0ID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQsIHByZXZDb3N0KSB7XHJcbiAgICAgICAgdmFyIHEgPSBuZXcgcHF1ZXVlXzEuUHJpb3JpdHlRdWV1ZShmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS5kIDw9IGIuZDsgfSksIHUgPSB0aGlzLm5laWdoYm91cnNbc3RhcnRdLCBxdSA9IG5ldyBRdWV1ZUVudHJ5KHUsIG51bGwsIDApLCB2aXNpdGVkRnJvbSA9IHt9O1xyXG4gICAgICAgIHEucHVzaChxdSk7XHJcbiAgICAgICAgd2hpbGUgKCFxLmVtcHR5KCkpIHtcclxuICAgICAgICAgICAgcXUgPSBxLnBvcCgpO1xyXG4gICAgICAgICAgICB1ID0gcXUubm9kZTtcclxuICAgICAgICAgICAgaWYgKHUuaWQgPT09IGVuZCkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGkgPSB1Lm5laWdoYm91cnMubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmVpZ2hib3VyID0gdS5uZWlnaGJvdXJzW2ldLCB2ID0gdGhpcy5uZWlnaGJvdXJzW25laWdoYm91ci5pZF07XHJcbiAgICAgICAgICAgICAgICBpZiAocXUucHJldiAmJiB2LmlkID09PSBxdS5wcmV2Lm5vZGUuaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmlkdWlkID0gdi5pZCArICcsJyArIHUuaWQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodmlkdWlkIGluIHZpc2l0ZWRGcm9tICYmIHZpc2l0ZWRGcm9tW3ZpZHVpZF0gPD0gcXUuZClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHZhciBjYyA9IHF1LnByZXYgPyBwcmV2Q29zdChxdS5wcmV2Lm5vZGUuaWQsIHUuaWQsIHYuaWQpIDogMCwgdCA9IHF1LmQgKyBuZWlnaGJvdXIuZGlzdGFuY2UgKyBjYztcclxuICAgICAgICAgICAgICAgIHZpc2l0ZWRGcm9tW3ZpZHVpZF0gPSB0O1xyXG4gICAgICAgICAgICAgICAgcS5wdXNoKG5ldyBRdWV1ZUVudHJ5KHYsIHF1LCB0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhdGggPSBbXTtcclxuICAgICAgICB3aGlsZSAocXUucHJldikge1xyXG4gICAgICAgICAgICBxdSA9IHF1LnByZXY7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChxdS5ub2RlLmlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9O1xyXG4gICAgQ2FsY3VsYXRvci5wcm90b3R5cGUuZGlqa3N0cmFOZWlnaGJvdXJzID0gZnVuY3Rpb24gKHN0YXJ0LCBkZXN0KSB7XHJcbiAgICAgICAgaWYgKGRlc3QgPT09IHZvaWQgMCkgeyBkZXN0ID0gLTE7IH1cclxuICAgICAgICB2YXIgcSA9IG5ldyBwcXVldWVfMS5Qcmlvcml0eVF1ZXVlKGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmQgPD0gYi5kOyB9KSwgaSA9IHRoaXMubmVpZ2hib3Vycy5sZW5ndGgsIGQgPSBuZXcgQXJyYXkoaSk7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubmVpZ2hib3Vyc1tpXTtcclxuICAgICAgICAgICAgbm9kZS5kID0gaSA9PT0gc3RhcnQgPyAwIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgICAgICAgICBub2RlLnEgPSBxLnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlICghcS5lbXB0eSgpKSB7XHJcbiAgICAgICAgICAgIHZhciB1ID0gcS5wb3AoKTtcclxuICAgICAgICAgICAgZFt1LmlkXSA9IHUuZDtcclxuICAgICAgICAgICAgaWYgKHUuaWQgPT09IGRlc3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYXRoID0gW107XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IHU7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodHlwZW9mIHYucHJldiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXRoLnB1c2godi5wcmV2LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICB2ID0gdi5wcmV2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSA9IHUubmVpZ2hib3Vycy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZWlnaGJvdXIgPSB1Lm5laWdoYm91cnNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IHRoaXMubmVpZ2hib3Vyc1tuZWlnaGJvdXIuaWRdO1xyXG4gICAgICAgICAgICAgICAgdmFyIHQgPSB1LmQgKyBuZWlnaGJvdXIuZGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodS5kICE9PSBOdW1iZXIuTUFYX1ZBTFVFICYmIHYuZCA+IHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LmQgPSB0O1xyXG4gICAgICAgICAgICAgICAgICAgIHYucHJldiA9IHU7XHJcbiAgICAgICAgICAgICAgICAgICAgcS5yZWR1Y2VLZXkodi5xLCB2LCBmdW5jdGlvbiAoZSwgcSkgeyByZXR1cm4gZS5xID0gcTsgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIENhbGN1bGF0b3I7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQ2FsY3VsYXRvciA9IENhbGN1bGF0b3I7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNob3J0ZXN0cGF0aHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFBvc2l0aW9uU3RhdHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUG9zaXRpb25TdGF0cyhzY2FsZSkge1xyXG4gICAgICAgIHRoaXMuc2NhbGUgPSBzY2FsZTtcclxuICAgICAgICB0aGlzLkFCID0gMDtcclxuICAgICAgICB0aGlzLkFEID0gMDtcclxuICAgICAgICB0aGlzLkEyID0gMDtcclxuICAgIH1cclxuICAgIFBvc2l0aW9uU3RhdHMucHJvdG90eXBlLmFkZFZhcmlhYmxlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2YXIgYWkgPSB0aGlzLnNjYWxlIC8gdi5zY2FsZTtcclxuICAgICAgICB2YXIgYmkgPSB2Lm9mZnNldCAvIHYuc2NhbGU7XHJcbiAgICAgICAgdmFyIHdpID0gdi53ZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5BQiArPSB3aSAqIGFpICogYmk7XHJcbiAgICAgICAgdGhpcy5BRCArPSB3aSAqIGFpICogdi5kZXNpcmVkUG9zaXRpb247XHJcbiAgICAgICAgdGhpcy5BMiArPSB3aSAqIGFpICogYWk7XHJcbiAgICB9O1xyXG4gICAgUG9zaXRpb25TdGF0cy5wcm90b3R5cGUuZ2V0UG9zbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuQUQgLSB0aGlzLkFCKSAvIHRoaXMuQTI7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBvc2l0aW9uU3RhdHM7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUG9zaXRpb25TdGF0cyA9IFBvc2l0aW9uU3RhdHM7XHJcbnZhciBDb25zdHJhaW50ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENvbnN0cmFpbnQobGVmdCwgcmlnaHQsIGdhcCwgZXF1YWxpdHkpIHtcclxuICAgICAgICBpZiAoZXF1YWxpdHkgPT09IHZvaWQgMCkgeyBlcXVhbGl0eSA9IGZhbHNlOyB9XHJcbiAgICAgICAgdGhpcy5sZWZ0ID0gbGVmdDtcclxuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XHJcbiAgICAgICAgdGhpcy5nYXAgPSBnYXA7XHJcbiAgICAgICAgdGhpcy5lcXVhbGl0eSA9IGVxdWFsaXR5O1xyXG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy51bnNhdGlzZmlhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sZWZ0ID0gbGVmdDtcclxuICAgICAgICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XHJcbiAgICAgICAgdGhpcy5nYXAgPSBnYXA7XHJcbiAgICAgICAgdGhpcy5lcXVhbGl0eSA9IGVxdWFsaXR5O1xyXG4gICAgfVxyXG4gICAgQ29uc3RyYWludC5wcm90b3R5cGUuc2xhY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudW5zYXRpc2ZpYWJsZSA/IE51bWJlci5NQVhfVkFMVUVcclxuICAgICAgICAgICAgOiB0aGlzLnJpZ2h0LnNjYWxlICogdGhpcy5yaWdodC5wb3NpdGlvbigpIC0gdGhpcy5nYXBcclxuICAgICAgICAgICAgICAgIC0gdGhpcy5sZWZ0LnNjYWxlICogdGhpcy5sZWZ0LnBvc2l0aW9uKCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIENvbnN0cmFpbnQ7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQ29uc3RyYWludCA9IENvbnN0cmFpbnQ7XHJcbnZhciBWYXJpYWJsZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBWYXJpYWJsZShkZXNpcmVkUG9zaXRpb24sIHdlaWdodCwgc2NhbGUpIHtcclxuICAgICAgICBpZiAod2VpZ2h0ID09PSB2b2lkIDApIHsgd2VpZ2h0ID0gMTsgfVxyXG4gICAgICAgIGlmIChzY2FsZSA9PT0gdm9pZCAwKSB7IHNjYWxlID0gMTsgfVxyXG4gICAgICAgIHRoaXMuZGVzaXJlZFBvc2l0aW9uID0gZGVzaXJlZFBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMud2VpZ2h0ID0gd2VpZ2h0O1xyXG4gICAgICAgIHRoaXMuc2NhbGUgPSBzY2FsZTtcclxuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XHJcbiAgICB9XHJcbiAgICBWYXJpYWJsZS5wcm90b3R5cGUuZGZkdiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gMi4wICogdGhpcy53ZWlnaHQgKiAodGhpcy5wb3NpdGlvbigpIC0gdGhpcy5kZXNpcmVkUG9zaXRpb24pO1xyXG4gICAgfTtcclxuICAgIFZhcmlhYmxlLnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuYmxvY2sucHMuc2NhbGUgKiB0aGlzLmJsb2NrLnBvc24gKyB0aGlzLm9mZnNldCkgLyB0aGlzLnNjYWxlO1xyXG4gICAgfTtcclxuICAgIFZhcmlhYmxlLnByb3RvdHlwZS52aXNpdE5laWdoYm91cnMgPSBmdW5jdGlvbiAocHJldiwgZikge1xyXG4gICAgICAgIHZhciBmZiA9IGZ1bmN0aW9uIChjLCBuZXh0KSB7IHJldHVybiBjLmFjdGl2ZSAmJiBwcmV2ICE9PSBuZXh0ICYmIGYoYywgbmV4dCk7IH07XHJcbiAgICAgICAgdGhpcy5jT3V0LmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGZmKGMsIGMucmlnaHQpOyB9KTtcclxuICAgICAgICB0aGlzLmNJbi5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IHJldHVybiBmZihjLCBjLmxlZnQpOyB9KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVmFyaWFibGU7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVmFyaWFibGUgPSBWYXJpYWJsZTtcclxudmFyIEJsb2NrID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEJsb2NrKHYpIHtcclxuICAgICAgICB0aGlzLnZhcnMgPSBbXTtcclxuICAgICAgICB2Lm9mZnNldCA9IDA7XHJcbiAgICAgICAgdGhpcy5wcyA9IG5ldyBQb3NpdGlvblN0YXRzKHYuc2NhbGUpO1xyXG4gICAgICAgIHRoaXMuYWRkVmFyaWFibGUodik7XHJcbiAgICB9XHJcbiAgICBCbG9jay5wcm90b3R5cGUuYWRkVmFyaWFibGUgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHYuYmxvY2sgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMudmFycy5wdXNoKHYpO1xyXG4gICAgICAgIHRoaXMucHMuYWRkVmFyaWFibGUodik7XHJcbiAgICAgICAgdGhpcy5wb3NuID0gdGhpcy5wcy5nZXRQb3NuKCk7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLnVwZGF0ZVdlaWdodGVkUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5wcy5BQiA9IHRoaXMucHMuQUQgPSB0aGlzLnBzLkEyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHRoaXMudmFycy5sZW5ndGg7IGkgPCBuOyArK2kpXHJcbiAgICAgICAgICAgIHRoaXMucHMuYWRkVmFyaWFibGUodGhpcy52YXJzW2ldKTtcclxuICAgICAgICB0aGlzLnBvc24gPSB0aGlzLnBzLmdldFBvc24oKTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUuY29tcHV0ZV9sbSA9IGZ1bmN0aW9uICh2LCB1LCBwb3N0QWN0aW9uKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgZGZkdiA9IHYuZGZkdigpO1xyXG4gICAgICAgIHYudmlzaXROZWlnaGJvdXJzKHUsIGZ1bmN0aW9uIChjLCBuZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciBfZGZkdiA9IF90aGlzLmNvbXB1dGVfbG0obmV4dCwgdiwgcG9zdEFjdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChuZXh0ID09PSBjLnJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBkZmR2ICs9IF9kZmR2ICogYy5sZWZ0LnNjYWxlO1xyXG4gICAgICAgICAgICAgICAgYy5sbSA9IF9kZmR2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGZkdiArPSBfZGZkdiAqIGMucmlnaHQuc2NhbGU7XHJcbiAgICAgICAgICAgICAgICBjLmxtID0gLV9kZmR2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBvc3RBY3Rpb24oYyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRmZHYgLyB2LnNjYWxlO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5wb3B1bGF0ZVNwbGl0QmxvY2sgPSBmdW5jdGlvbiAodiwgcHJldikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdi52aXNpdE5laWdoYm91cnMocHJldiwgZnVuY3Rpb24gKGMsIG5leHQpIHtcclxuICAgICAgICAgICAgbmV4dC5vZmZzZXQgPSB2Lm9mZnNldCArIChuZXh0ID09PSBjLnJpZ2h0ID8gYy5nYXAgOiAtYy5nYXApO1xyXG4gICAgICAgICAgICBfdGhpcy5hZGRWYXJpYWJsZShuZXh0KTtcclxuICAgICAgICAgICAgX3RoaXMucG9wdWxhdGVTcGxpdEJsb2NrKG5leHQsIHYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS50cmF2ZXJzZSA9IGZ1bmN0aW9uICh2aXNpdCwgYWNjLCB2LCBwcmV2KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAodiA9PT0gdm9pZCAwKSB7IHYgPSB0aGlzLnZhcnNbMF07IH1cclxuICAgICAgICBpZiAocHJldiA9PT0gdm9pZCAwKSB7IHByZXYgPSBudWxsOyB9XHJcbiAgICAgICAgdi52aXNpdE5laWdoYm91cnMocHJldiwgZnVuY3Rpb24gKGMsIG5leHQpIHtcclxuICAgICAgICAgICAgYWNjLnB1c2godmlzaXQoYykpO1xyXG4gICAgICAgICAgICBfdGhpcy50cmF2ZXJzZSh2aXNpdCwgYWNjLCBuZXh0LCB2KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUuZmluZE1pbkxNID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNvbXB1dGVfbG0odGhpcy52YXJzWzBdLCBudWxsLCBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgICAgICBpZiAoIWMuZXF1YWxpdHkgJiYgKG0gPT09IG51bGwgfHwgYy5sbSA8IG0ubG0pKVxyXG4gICAgICAgICAgICAgICAgbSA9IGM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG07XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLmZpbmRNaW5MTUJldHdlZW4gPSBmdW5jdGlvbiAobHYsIHJ2KSB7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlX2xtKGx2LCBudWxsLCBmdW5jdGlvbiAoKSB7IH0pO1xyXG4gICAgICAgIHZhciBtID0gbnVsbDtcclxuICAgICAgICB0aGlzLmZpbmRQYXRoKGx2LCBudWxsLCBydiwgZnVuY3Rpb24gKGMsIG5leHQpIHtcclxuICAgICAgICAgICAgaWYgKCFjLmVxdWFsaXR5ICYmIGMucmlnaHQgPT09IG5leHQgJiYgKG0gPT09IG51bGwgfHwgYy5sbSA8IG0ubG0pKVxyXG4gICAgICAgICAgICAgICAgbSA9IGM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG07XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLmZpbmRQYXRoID0gZnVuY3Rpb24gKHYsIHByZXYsIHRvLCB2aXNpdCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGVuZEZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgdi52aXNpdE5laWdoYm91cnMocHJldiwgZnVuY3Rpb24gKGMsIG5leHQpIHtcclxuICAgICAgICAgICAgaWYgKCFlbmRGb3VuZCAmJiAobmV4dCA9PT0gdG8gfHwgX3RoaXMuZmluZFBhdGgobmV4dCwgdiwgdG8sIHZpc2l0KSkpIHtcclxuICAgICAgICAgICAgICAgIGVuZEZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHZpc2l0KGMsIG5leHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGVuZEZvdW5kO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5pc0FjdGl2ZURpcmVjdGVkUGF0aEJldHdlZW4gPSBmdW5jdGlvbiAodSwgdikge1xyXG4gICAgICAgIGlmICh1ID09PSB2KVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB2YXIgaSA9IHUuY091dC5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICB2YXIgYyA9IHUuY091dFtpXTtcclxuICAgICAgICAgICAgaWYgKGMuYWN0aXZlICYmIHRoaXMuaXNBY3RpdmVEaXJlY3RlZFBhdGhCZXR3ZWVuKGMucmlnaHQsIHYpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICBCbG9jay5zcGxpdCA9IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgYy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gW0Jsb2NrLmNyZWF0ZVNwbGl0QmxvY2soYy5sZWZ0KSwgQmxvY2suY3JlYXRlU3BsaXRCbG9jayhjLnJpZ2h0KV07XHJcbiAgICB9O1xyXG4gICAgQmxvY2suY3JlYXRlU3BsaXRCbG9jayA9IGZ1bmN0aW9uIChzdGFydFZhcikge1xyXG4gICAgICAgIHZhciBiID0gbmV3IEJsb2NrKHN0YXJ0VmFyKTtcclxuICAgICAgICBiLnBvcHVsYXRlU3BsaXRCbG9jayhzdGFydFZhciwgbnVsbCk7XHJcbiAgICAgICAgcmV0dXJuIGI7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLnNwbGl0QmV0d2VlbiA9IGZ1bmN0aW9uICh2bCwgdnIpIHtcclxuICAgICAgICB2YXIgYyA9IHRoaXMuZmluZE1pbkxNQmV0d2Vlbih2bCwgdnIpO1xyXG4gICAgICAgIGlmIChjICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBicyA9IEJsb2NrLnNwbGl0KGMpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBjb25zdHJhaW50OiBjLCBsYjogYnNbMF0sIHJiOiBic1sxXSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUubWVyZ2VBY3Jvc3MgPSBmdW5jdGlvbiAoYiwgYywgZGlzdCkge1xyXG4gICAgICAgIGMuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGIudmFycy5sZW5ndGg7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIHYgPSBiLnZhcnNbaV07XHJcbiAgICAgICAgICAgIHYub2Zmc2V0ICs9IGRpc3Q7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVmFyaWFibGUodik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zbiA9IHRoaXMucHMuZ2V0UG9zbigpO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5jb3N0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdW0gPSAwLCBpID0gdGhpcy52YXJzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciB2ID0gdGhpcy52YXJzW2ldLCBkID0gdi5wb3NpdGlvbigpIC0gdi5kZXNpcmVkUG9zaXRpb247XHJcbiAgICAgICAgICAgIHN1bSArPSBkICogZCAqIHYud2VpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VtO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBCbG9jaztcclxufSgpKTtcclxuZXhwb3J0cy5CbG9jayA9IEJsb2NrO1xyXG52YXIgQmxvY2tzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEJsb2Nrcyh2cykge1xyXG4gICAgICAgIHRoaXMudnMgPSB2cztcclxuICAgICAgICB2YXIgbiA9IHZzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmxpc3QgPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgd2hpbGUgKG4tLSkge1xyXG4gICAgICAgICAgICB2YXIgYiA9IG5ldyBCbG9jayh2c1tuXSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdFtuXSA9IGI7XHJcbiAgICAgICAgICAgIGIuYmxvY2tJbmQgPSBuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEJsb2Nrcy5wcm90b3R5cGUuY29zdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc3VtID0gMCwgaSA9IHRoaXMubGlzdC5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKGktLSlcclxuICAgICAgICAgICAgc3VtICs9IHRoaXMubGlzdFtpXS5jb3N0KCk7XHJcbiAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgIH07XHJcbiAgICBCbG9ja3MucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uIChiKSB7XHJcbiAgICAgICAgYi5ibG9ja0luZCA9IHRoaXMubGlzdC5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5saXN0LnB1c2goYik7XHJcbiAgICB9O1xyXG4gICAgQmxvY2tzLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoYikge1xyXG4gICAgICAgIHZhciBsYXN0ID0gdGhpcy5saXN0Lmxlbmd0aCAtIDE7XHJcbiAgICAgICAgdmFyIHN3YXBCbG9jayA9IHRoaXMubGlzdFtsYXN0XTtcclxuICAgICAgICB0aGlzLmxpc3QubGVuZ3RoID0gbGFzdDtcclxuICAgICAgICBpZiAoYiAhPT0gc3dhcEJsb2NrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdFtiLmJsb2NrSW5kXSA9IHN3YXBCbG9jaztcclxuICAgICAgICAgICAgc3dhcEJsb2NrLmJsb2NrSW5kID0gYi5ibG9ja0luZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgQmxvY2tzLnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgdmFyIGwgPSBjLmxlZnQuYmxvY2ssIHIgPSBjLnJpZ2h0LmJsb2NrO1xyXG4gICAgICAgIHZhciBkaXN0ID0gYy5yaWdodC5vZmZzZXQgLSBjLmxlZnQub2Zmc2V0IC0gYy5nYXA7XHJcbiAgICAgICAgaWYgKGwudmFycy5sZW5ndGggPCByLnZhcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHIubWVyZ2VBY3Jvc3MobCwgYywgZGlzdCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbC5tZXJnZUFjcm9zcyhyLCBjLCAtZGlzdCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKHIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBCbG9ja3MucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGYpO1xyXG4gICAgfTtcclxuICAgIEJsb2Nrcy5wcm90b3R5cGUudXBkYXRlQmxvY2tQb3NpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZnVuY3Rpb24gKGIpIHsgcmV0dXJuIGIudXBkYXRlV2VpZ2h0ZWRQb3NpdGlvbigpOyB9KTtcclxuICAgIH07XHJcbiAgICBCbG9ja3MucHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gKGluYWN0aXZlKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLnVwZGF0ZUJsb2NrUG9zaXRpb25zKCk7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZnVuY3Rpb24gKGIpIHtcclxuICAgICAgICAgICAgdmFyIHYgPSBiLmZpbmRNaW5MTSgpO1xyXG4gICAgICAgICAgICBpZiAodiAhPT0gbnVsbCAmJiB2LmxtIDwgU29sdmVyLkxBR1JBTkdJQU5fVE9MRVJBTkNFKSB7XHJcbiAgICAgICAgICAgICAgICBiID0gdi5sZWZ0LmJsb2NrO1xyXG4gICAgICAgICAgICAgICAgQmxvY2suc3BsaXQodikuZm9yRWFjaChmdW5jdGlvbiAobmIpIHsgcmV0dXJuIF90aGlzLmluc2VydChuYik7IH0pO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMucmVtb3ZlKGIpO1xyXG4gICAgICAgICAgICAgICAgaW5hY3RpdmUucHVzaCh2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBCbG9ja3M7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQmxvY2tzID0gQmxvY2tzO1xyXG52YXIgU29sdmVyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFNvbHZlcih2cywgY3MpIHtcclxuICAgICAgICB0aGlzLnZzID0gdnM7XHJcbiAgICAgICAgdGhpcy5jcyA9IGNzO1xyXG4gICAgICAgIHRoaXMudnMgPSB2cztcclxuICAgICAgICB2cy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIHYuY0luID0gW10sIHYuY091dCA9IFtdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY3MgPSBjcztcclxuICAgICAgICBjcy5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgIGMubGVmdC5jT3V0LnB1c2goYyk7XHJcbiAgICAgICAgICAgIGMucmlnaHQuY0luLnB1c2goYyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5pbmFjdGl2ZSA9IGNzLm1hcChmdW5jdGlvbiAoYykgeyBjLmFjdGl2ZSA9IGZhbHNlOyByZXR1cm4gYzsgfSk7XHJcbiAgICAgICAgdGhpcy5icyA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBTb2x2ZXIucHJvdG90eXBlLmNvc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnMuY29zdCgpO1xyXG4gICAgfTtcclxuICAgIFNvbHZlci5wcm90b3R5cGUuc2V0U3RhcnRpbmdQb3NpdGlvbnMgPSBmdW5jdGlvbiAocHMpIHtcclxuICAgICAgICB0aGlzLmluYWN0aXZlID0gdGhpcy5jcy5tYXAoZnVuY3Rpb24gKGMpIHsgYy5hY3RpdmUgPSBmYWxzZTsgcmV0dXJuIGM7IH0pO1xyXG4gICAgICAgIHRoaXMuYnMgPSBuZXcgQmxvY2tzKHRoaXMudnMpO1xyXG4gICAgICAgIHRoaXMuYnMuZm9yRWFjaChmdW5jdGlvbiAoYiwgaSkgeyByZXR1cm4gYi5wb3NuID0gcHNbaV07IH0pO1xyXG4gICAgfTtcclxuICAgIFNvbHZlci5wcm90b3R5cGUuc2V0RGVzaXJlZFBvc2l0aW9ucyA9IGZ1bmN0aW9uIChwcykge1xyXG4gICAgICAgIHRoaXMudnMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gdi5kZXNpcmVkUG9zaXRpb24gPSBwc1tpXTsgfSk7XHJcbiAgICB9O1xyXG4gICAgU29sdmVyLnByb3RvdHlwZS5tb3N0VmlvbGF0ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1pblNsYWNrID0gTnVtYmVyLk1BWF9WQUxVRSwgdiA9IG51bGwsIGwgPSB0aGlzLmluYWN0aXZlLCBuID0gbC5sZW5ndGgsIGRlbGV0ZVBvaW50ID0gbjtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgYyA9IGxbaV07XHJcbiAgICAgICAgICAgIGlmIChjLnVuc2F0aXNmaWFibGUpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgdmFyIHNsYWNrID0gYy5zbGFjaygpO1xyXG4gICAgICAgICAgICBpZiAoYy5lcXVhbGl0eSB8fCBzbGFjayA8IG1pblNsYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBtaW5TbGFjayA9IHNsYWNrO1xyXG4gICAgICAgICAgICAgICAgdiA9IGM7XHJcbiAgICAgICAgICAgICAgICBkZWxldGVQb2ludCA9IGk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYy5lcXVhbGl0eSlcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVsZXRlUG9pbnQgIT09IG4gJiZcclxuICAgICAgICAgICAgKG1pblNsYWNrIDwgU29sdmVyLlpFUk9fVVBQRVJCT1VORCAmJiAhdi5hY3RpdmUgfHwgdi5lcXVhbGl0eSkpIHtcclxuICAgICAgICAgICAgbFtkZWxldGVQb2ludF0gPSBsW24gLSAxXTtcclxuICAgICAgICAgICAgbC5sZW5ndGggPSBuIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHY7XHJcbiAgICB9O1xyXG4gICAgU29sdmVyLnByb3RvdHlwZS5zYXRpc2Z5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJzID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5icyA9IG5ldyBCbG9ja3ModGhpcy52cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnMuc3BsaXQodGhpcy5pbmFjdGl2ZSk7XHJcbiAgICAgICAgdmFyIHYgPSBudWxsO1xyXG4gICAgICAgIHdoaWxlICgodiA9IHRoaXMubW9zdFZpb2xhdGVkKCkpICYmICh2LmVxdWFsaXR5IHx8IHYuc2xhY2soKSA8IFNvbHZlci5aRVJPX1VQUEVSQk9VTkQgJiYgIXYuYWN0aXZlKSkge1xyXG4gICAgICAgICAgICB2YXIgbGIgPSB2LmxlZnQuYmxvY2ssIHJiID0gdi5yaWdodC5ibG9jaztcclxuICAgICAgICAgICAgaWYgKGxiICE9PSByYikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5icy5tZXJnZSh2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChsYi5pc0FjdGl2ZURpcmVjdGVkUGF0aEJldHdlZW4odi5yaWdodCwgdi5sZWZ0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYudW5zYXRpc2ZpYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgc3BsaXQgPSBsYi5zcGxpdEJldHdlZW4odi5sZWZ0LCB2LnJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnMuaW5zZXJ0KHNwbGl0LmxiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJzLmluc2VydChzcGxpdC5yYik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icy5yZW1vdmUobGIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5hY3RpdmUucHVzaChzcGxpdC5jb25zdHJhaW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHYudW5zYXRpc2ZpYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5zbGFjaygpID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluYWN0aXZlLnB1c2godik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJzLm1lcmdlKHYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFNvbHZlci5wcm90b3R5cGUuc29sdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zYXRpc2Z5KCk7XHJcbiAgICAgICAgdmFyIGxhc3Rjb3N0ID0gTnVtYmVyLk1BWF9WQUxVRSwgY29zdCA9IHRoaXMuYnMuY29zdCgpO1xyXG4gICAgICAgIHdoaWxlIChNYXRoLmFicyhsYXN0Y29zdCAtIGNvc3QpID4gMC4wMDAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F0aXNmeSgpO1xyXG4gICAgICAgICAgICBsYXN0Y29zdCA9IGNvc3Q7XHJcbiAgICAgICAgICAgIGNvc3QgPSB0aGlzLmJzLmNvc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvc3Q7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFNvbHZlcjtcclxufSgpKTtcclxuU29sdmVyLkxBR1JBTkdJQU5fVE9MRVJBTkNFID0gLTFlLTQ7XHJcblNvbHZlci5aRVJPX1VQUEVSQk9VTkQgPSAtMWUtMTA7XHJcbmV4cG9ydHMuU29sdmVyID0gU29sdmVyO1xyXG5mdW5jdGlvbiByZW1vdmVPdmVybGFwSW5PbmVEaW1lbnNpb24oc3BhbnMsIGxvd2VyQm91bmQsIHVwcGVyQm91bmQpIHtcclxuICAgIHZhciB2cyA9IHNwYW5zLm1hcChmdW5jdGlvbiAocykgeyByZXR1cm4gbmV3IFZhcmlhYmxlKHMuZGVzaXJlZENlbnRlcik7IH0pO1xyXG4gICAgdmFyIGNzID0gW107XHJcbiAgICB2YXIgbiA9IHNwYW5zLmxlbmd0aDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbiAtIDE7IGkrKykge1xyXG4gICAgICAgIHZhciBsZWZ0ID0gc3BhbnNbaV0sIHJpZ2h0ID0gc3BhbnNbaSArIDFdO1xyXG4gICAgICAgIGNzLnB1c2gobmV3IENvbnN0cmFpbnQodnNbaV0sIHZzW2kgKyAxXSwgKGxlZnQuc2l6ZSArIHJpZ2h0LnNpemUpIC8gMikpO1xyXG4gICAgfVxyXG4gICAgdmFyIGxlZnRNb3N0ID0gdnNbMF0sIHJpZ2h0TW9zdCA9IHZzW24gLSAxXSwgbGVmdE1vc3RTaXplID0gc3BhbnNbMF0uc2l6ZSAvIDIsIHJpZ2h0TW9zdFNpemUgPSBzcGFuc1tuIC0gMV0uc2l6ZSAvIDI7XHJcbiAgICB2YXIgdkxvd2VyID0gbnVsbCwgdlVwcGVyID0gbnVsbDtcclxuICAgIGlmIChsb3dlckJvdW5kKSB7XHJcbiAgICAgICAgdkxvd2VyID0gbmV3IFZhcmlhYmxlKGxvd2VyQm91bmQsIGxlZnRNb3N0LndlaWdodCAqIDEwMDApO1xyXG4gICAgICAgIHZzLnB1c2godkxvd2VyKTtcclxuICAgICAgICBjcy5wdXNoKG5ldyBDb25zdHJhaW50KHZMb3dlciwgbGVmdE1vc3QsIGxlZnRNb3N0U2l6ZSkpO1xyXG4gICAgfVxyXG4gICAgaWYgKHVwcGVyQm91bmQpIHtcclxuICAgICAgICB2VXBwZXIgPSBuZXcgVmFyaWFibGUodXBwZXJCb3VuZCwgcmlnaHRNb3N0LndlaWdodCAqIDEwMDApO1xyXG4gICAgICAgIHZzLnB1c2godlVwcGVyKTtcclxuICAgICAgICBjcy5wdXNoKG5ldyBDb25zdHJhaW50KHJpZ2h0TW9zdCwgdlVwcGVyLCByaWdodE1vc3RTaXplKSk7XHJcbiAgICB9XHJcbiAgICB2YXIgc29sdmVyID0gbmV3IFNvbHZlcih2cywgY3MpO1xyXG4gICAgc29sdmVyLnNvbHZlKCk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5ld0NlbnRlcnM6IHZzLnNsaWNlKDAsIHNwYW5zLmxlbmd0aCkubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnBvc2l0aW9uKCk7IH0pLFxyXG4gICAgICAgIGxvd2VyQm91bmQ6IHZMb3dlciA/IHZMb3dlci5wb3NpdGlvbigpIDogbGVmdE1vc3QucG9zaXRpb24oKSAtIGxlZnRNb3N0U2l6ZSxcclxuICAgICAgICB1cHBlckJvdW5kOiB2VXBwZXIgPyB2VXBwZXIucG9zaXRpb24oKSA6IHJpZ2h0TW9zdC5wb3NpdGlvbigpICsgcmlnaHRNb3N0U2l6ZVxyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLnJlbW92ZU92ZXJsYXBJbk9uZURpbWVuc2lvbiA9IHJlbW92ZU92ZXJsYXBJbk9uZURpbWVuc2lvbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dnBzYy5qcy5tYXAiXX0=