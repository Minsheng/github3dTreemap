/* 
Created and modified by Davidson Zheng

Script originally written by Bill White 
reference: http://www.billdwhite.com/wordpress/2012/12/16/d3-treemap-with-title-headers/
*/

// large dataset
var full_url_10 = "https://raw.githubusercontent.com/Minsheng/github3dTreemap/master/data/tree_data_10.json";
// medium dataset
var full_url_2 = "https://raw.githubusercontent.com/Minsheng/github3dTreemap/master/data/tree_data_2.json";
// small dataset
var sample_url = "https://raw.githubusercontent.com/Minsheng/github3dTreemap/master/data/sample_format.json";

var chartWidth;
var chartHeight;

window.onload = function() {
  init();
};

// Dropdown menu event
$(document).ready(function(){
    $(".dropdown-menu ul li").click(function(e) {
        e.stopPropagation();
    });
    
    $("#2d").click(function() {
        $("#3d").parent().removeClass("active");
        $(this).parent().toggleClass("active");
        init();
    });

    $("#3d").click(function() {
        $("#2d").parent().removeClass("active");
        $(this).parent().toggleClass("active");
        init();
    });

    // update data source
    $(".data-select li a").click(function() {
        $(".data-select li a").not(this).parent().removeClass("active");
        $(this).parent().toggleClass("active");
        init();
    });

    // update canvas size
    $(".size-select li a").click(function() {
        $(".size-select li a").not(this).parent().removeClass("active");
        $(this).parent().toggleClass("active");
        init();
    });
});

var init = function() {
    $("#body").empty();
    initParameters();
    initVisualization(calcDataSource(), calcDimension());
};

var initParameters = function() {
    var windowSize = calcWindowSize();
    chartWidth = windowSize[0];
    chartHeight = windowSize[1];
};

var calcDataSource = function() {
    var selected = $(".data-select li.active").attr("id");
    switch (selected) {
        case "d1":
            return sample_url;
            break;
        case "d2":
            return full_url_2;
            break;
        case "d3":
            return full_url_10;
            break;
    }

    return sample_url;
};

var calcWindowSize = function() {
    var selected = $(".size-select li.active").attr("id");
    switch (selected) {
        case "s1":
            return [640, 480];
            break;
        case "s2":
            return [800, 600];
            break;
        case "s3":
            return [960, 720];
            break;
        case "s4":
            return [1440, 900];
            break;
    }

    return [600, 400];
};

var calcDimension = function() {
    return $(".nav li.active").find("a").attr("id");
};

var initVisualization = function(dataSrc, dimensionStr) {
    if (dimensionStr == "2d") {
        d3.json(dataSrc, function(error, data) {
            if (error) throw error;

            var treemap2d = demo.Treemap2d(); // function variable

            var chart = d3.select("#body")
                .append("svg:svg")
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .append("svg:g");

            chart.call(treemap2d);

            treemap2d.load(data);
        });

        var demo = {};

        demo.Treemap2d = function() {
            
            var xscale = d3.scale.linear().range([0, chartWidth]);
            var yscale = d3.scale.linear().range([0, chartHeight]);
            var color = d3.scale.category10();
            var headerHeight = 20;
            var headerColor = "#424242"; // darker grey
            var transitionDuration = 500;
            var root;
            var node;
            var treemap;

            function Treemap2d(selection) { // constructor
                Treemap2d.load = function(data) { // method
                    treemap = d3.layout.treemap()
                        .round(false)
                        .size([chartWidth, chartHeight])
                        .sticky(true)
                        .value(function(d) {
                            return d.commits;
                        });

                    node = root = data;
                    var nodes = treemap.nodes(root);

                    // get all the leaf arrays, to be squarified by number of commits
                    var children = nodes.filter(function(d) {
                        return !d.children;
                    });

                    // get all the parent arrays, to be squarified by number of stars
                    var parents = nodes.filter(function(d) {
                        return d.children;
                    });

                    // create parent cells, including 2nd level and 3rd level parent cells
                    var parentCells = selection.selectAll("g.cell.parent") // selecting <g></g> with class "cell parent"
                        .data(parents, function(d) {
                            return "p-" + d.name;
                        });

                    // create html elements
                    var parentEnterTransition = parentCells.enter()
                        .append("g")
                        .attr("class", "cell parent")
                        .on("click", function(d) { // zoom in animation
                            zoom(d);
                        })
                        .append("svg")
                        .attr("class", "clip") // for clip selection
                        .attr("width", function(d) {
                            return Math.max(0.01, d.dx); // get the x-extend as the width of the parent node
                        })
                        .attr("height", headerHeight); // assign height to the parent cell

                    parentEnterTransition.append("rect") // attributes for svg elements
                        .attr("width", function(d) {
                            return Math.max(0.01, d.dx);
                        })
                        .attr("height", headerHeight)
                        .style("fill", headerColor);

                    parentEnterTransition.append('text') // texts for the parent nodes
                        .attr("class", "label")
                        .attr("transform", "translate(3, 13)")
                        .attr("width", function(d) {
                            return Math.max(0.01, d.dx);
                        })
                        .attr("height", headerHeight)
                        .text(function(d) {
                            return d.name;
                        });

                    /* up to this point, parent nodes are placed in the top row */
                    // update transition
                    var parentUpdateTransition = parentCells.transition().duration(transitionDuration);
                    parentUpdateTransition.select(".cell")
                        .attr("transform", function(d) {
                            return "translate(" + d.dx + "," + d.y + ")";
                        });
                    parentUpdateTransition.select("rect")
                        .attr("width", function(d) {
                            return Math.max(0.01, d.dx);
                        })
                        .attr("height", headerHeight)
                        .style("fill", headerColor);
                    parentUpdateTransition.select(".label")
                        .attr("transform", "translate(3, 13)")
                        .attr("width", function(d) {
                            return Math.max(0.01, d.dx);
                        })
                        .attr("height", headerHeight)
                        .text(function(d) {
                            return d.name;
                        });
                    // remove transition
                    parentCells.exit()
                        .remove();

                    // create children cells
                    var childrenCells = selection.selectAll("g.cell.child")
                        .data(children, function(d) {
                            return "c-" + d.name;
                        });
                    // enter transition
                    var childEnterTransition = childrenCells.enter() // get children data
                        .append("g")
                        .attr("class", "cell child") // create <g class="cell child"> under parent tags
                        .on("click", function(d) { // zoom in for children nodes
                            zoom(node === d.parent ? root : d.parent); // if click on parent node, zoom out to root
                        })
                        .append("svg")
                        .attr("class", "clip");

                    childEnterTransition.append("rect")
                        .classed("background", true)
                        .style("fill", function(d) {
                            return color(d.parent.name);
                        });

                    childEnterTransition.append('text')
                        .attr("class", "label")
                        .attr('x', function(d) {
                            return d.dx / 2;
                        })
                        .attr('y', function(d) {
                            return d.dy / 2;
                        })
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .style("display", "none")
                        .text(function(d) {
                            return d.name;
                        });
                    // update transition
                    var childUpdateTransition = childrenCells.transition().duration(transitionDuration);
                    childUpdateTransition.select(".cell")
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });
                    childUpdateTransition.select("rect")
                        .attr("width", function(d) {
                            return Math.max(0.01, d.dx);
                        })
                        .attr("height", function(d) {
                            return d.dy;
                        })
                        .style("fill", function(d) {
                            return color(d.parent.name);
                        });
                    childUpdateTransition.select(".label")
                        .attr('x', function(d) {
                            return d.dx / 2;
                        })
                        .attr('y', function(d) {
                            return d.dy / 2;
                        })
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .style("display", "none")
                        .text(function(d) {
                            return d.name;
                        });

                    // exit transition
                    childrenCells.exit()
                        .remove();

                    zoom(node);
                }

                function textHeight(d) {
                    var ky = chartHeight / d.dy;
                    yscale.domain([d.y, d.y + d.dy]);
                    return (ky * d.dy) / headerHeight;
                }

                function getRGBComponents(color) {
                    var r = color.substring(1, 3);
                    var g = color.substring(3, 5);
                    var b = color.substring(5, 7);
                    return {
                        R: parseInt(r, 16),
                        G: parseInt(g, 16),
                        B: parseInt(b, 16)
                    };
                }


                function idealTextColor(bgColor) {
                    var nThreshold = 105;
                    var components = getRGBComponents(bgColor);
                    var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
                    return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
                }


                function zoom(d) {
                    treemap
                        .padding([headerHeight / (chartHeight / d.dy), 0, 0, 0])
                        .nodes(d);

                    var kx = chartWidth / d.dx;
                    var ky = chartHeight / d.dy;
                    var level = d;

                    xscale.domain([d.x, d.x + d.dx]);
                    yscale.domain([d.y, d.y + d.dy]);

                    if (node != level) {
                        selection.selectAll(".cell.child .label")
                            .style("display", "none");
                    }

                    var zoomTransition = selection.selectAll("g.cell").transition().duration(transitionDuration)
                        .attr("transform", function(d) {
                            return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")";
                        })
                        .each("start", function() {
                            d3.select(this).select("label")
                                .style("display", "none");
                        })
                        .each("end", function(d, i) {
                            if (!i && (level !== root)) {
                                selection.selectAll(".cell.child")
                                    .filter(function(d) {
                                        return d.parent === node; // only get the children for selected group
                                    })
                                    .select(".label")
                                    .style("display", "")
                                    .style("fill", function(d) {
                                        return idealTextColor(color(d.parent.name));
                                    });
                            }
                        });

                    zoomTransition.select(".clip")
                        .attr("width", function(d) {
                            return Math.max(0.01, (kx * d.dx));
                        })
                        .attr("height", function(d) {
                            return d.children ? headerHeight : Math.max(0.01, (ky * d.dy));
                        });

                    zoomTransition.select(".label")
                        .attr("width", function(d) {
                            return Math.max(0.01, (kx * d.dx));
                        })
                        .attr("height", function(d) {
                            return d.children ? headerHeight : Math.max(0.01, (ky * d.dy));
                        })
                        .text(function(d) {
                            return d.name;
                        });

                    zoomTransition.select(".child .label")
                        .attr("x", function(d) {
                            return kx * d.dx / 2;
                        })
                        .attr("y", function(d) {
                            return ky * d.dy / 2;
                        });

                    zoomTransition.select("rect")
                        .attr("width", function(d) {
                            return Math.max(0.01, (kx * d.dx));
                        })
                        .attr("height", function(d) {
                            return d.children ? headerHeight : Math.max(0.01, (ky * d.dy));
                        })
                        .style("fill", function(d) {
                            return d.children ? headerColor : color(d.parent.name);
                        });

                    node = d;

                    if (d3.event) {
                        d3.event.stopPropagation();
                    }
                }
            }
            return Treemap2d;
        };
    } else { // 3d
        d3.json(dataSrc, function(error, data) {
            if (error) throw error;

            var treemap3d = demo.Treemap3d(); // function variable
            d3.select("#body").append("div")
                .style("position", "relative")
                .call(treemap3d);

           treemap3d.load(data);
        });

        demo = {};

        demo.Treemap3d = function() {

            "use strict";

            var _width          = chartWidth,
                _height         = chartHeight,
                _renderer       = null,
                _controls       = null,
                _scene          = new THREE.Scene(),
                _camera         = new THREE.PerspectiveCamera(45, _width/_height , 1, 10000),
                // assign color based on different names
                _colorScale     = d3.scale.category20b(), 
                _scaler         = d3.scale.linear().domain([0, 10000]).range([0,1000]), // scale down the number
                parentCells     = null,
                childrenCells   = null,
                _showLabels     = true,
                _boxMap         = {};
            
            _scaler.clamp(true); // enable clamping
            var parentColorSet = ["#0C090A", "#4C4646", "#565051", "#6D6968", "#E5E4E2"];
            var root;
            var node;

            var clock = new THREE.Clock();

            function Treemap3d(selection) {
                _camera.setLens(30);
                _camera.position.set(0, 0, 3000);
                _camera.lookAt(_scene.position);

                _renderer = Modernizr.webgl ? new THREE.WebGLRenderer({antialias: false}) : new THREE.CanvasRenderer();
                _renderer.setSize(_width, _height);
                _renderer.setClearColor(0xFFFFFF);
                _renderer.domElement.style.position = 'absolute';
                _renderer.shadowMap.enabled = true;
                _renderer.shadowMapSoft = true;
                _renderer.shadowMap.type = THREE.PCFShadowMap;
                _renderer.shadowMapAutoUpdate = true;
                
                selection.node().appendChild(_renderer.domElement);
                
                function enterHandler(d) {
                    var boxGeometry = new THREE.BoxGeometry(1,1,1);
                    var boxMaterial = new THREE.MeshLambertMaterial({color: assignColor(d)});
                    var box = new THREE.Mesh(boxGeometry, boxMaterial);
                    box.castShadow = true;
                    _boxMap[d.name] = box;
                    _scene.add(box);
                }

                /* Assign colors for parents and children nodes */
                function assignColor(d) {
                    var tier = getTier(d);

                    if (tier == 4) {
                        for (var key in _boxMap) {
                            // if there are siblings, use the same color
                            if (key == d.parent.name) {
                                return _colorScale(key);
                            }
                        }
                        return _colorScale(d.name);
                    }

                    return parentColorSet[tier-1];
                }

                /* Return the tier number in the master data list */
                function getTier(d) {
                    if (!d.parent) {
                        return 1; // root node
                    }
                    if (!d.children) {
                        return 4; // leaf node
                    }

                    if (d.parent) { // at least tier 2 nodes
                        if (d.parent.parent) {
                            return 3;
                        }
                        return 2;
                    }
                }
                
                function updateHandler(d) {
                    var duration = 1000; // duration for animation
                    var zvalue; // vertical position
                    var color;
                    var depth; // thickness of cube
                    var parentDepth = {1:-32, 2:-24, 3:-16};

                    if (d.children) { // parent nodes
                        zvalue = parentDepth[getTier(d)]; // tier 3:-16, 2:-24, 1: -32
                        depth = 1;
                    } else {
                        zvalue = _scaler(d.commits);
                        depth = zvalue;
                    }
                    
                    var box = _boxMap[d.name]; // get box by name
                    box.material.color.set(assignColor(d));
                    var newMetrics = {
                        x: (d.x + (d.dx / 2) - _width / 2),
                        y: (d.y + (d.dy / 2) - _height / 2),
                        z: (zvalue / 2),
                        w: Math.max(0, d.dx-1),
                        h: Math.max(0, d.dy-1),
                        d: depth
                    };

                    // refer to http://sole.github.io/tween.js/examples/03_graphs.html for the animation Sinusoidal.In and Out
                    var coords = new TWEEN.Tween(box.position)
                        .to({x: newMetrics.x, y: newMetrics.y, z: newMetrics.z}, duration)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();
                        
                    // replace zero values for x/y/z, otherwise will cause matrix inverse exception
                    var dims = new TWEEN.Tween(box.scale)
                        .to({x: zeroValFilter(newMetrics.w), y: zeroValFilter(newMetrics.h), z: zeroValFilter(newMetrics.d)}, duration)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();
                        
                    var newRot = box.rotation;
                    var rotate = new TWEEN.Tween(box.rotation)
                        .to({x: newRot.x, y: newRot.y, z: newRot.z}, duration)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();
                    
                    // to be notified at every modification
                    var update = new TWEEN.Tween(this)
                        .to({}, duration)
                        .onUpdate(_.bind(render, this))
                        .start();
                }

                function zeroValFilter(val) {
                    if (val == 0) return 0.1;
                    return val;
                }
                
                function exitHandler(d) {
                    var box = _boxMap[d.name];
                    _scene.remove(box);
                    delete _boxMap[d.name];
                }
                
                function transform() {
                    TWEEN.removeAll();
                    parentCells.each(updateHandler);
                    childrenCells.each(updateHandler);
                }
                
                function render() {
                    
                    _renderer.render(_scene, _camera);
                }
                
                function animate() {
                    requestAnimationFrame(animate);
                    TWEEN.update();
                    _controls.update( clock.getDelta() );
                }
                    
                Treemap3d.load = function(data) {
                    var treemap = d3.layout.treemap()
                        .size([_width, _height])
                        .sticky(true)
                        .value(function(d) { 
                            return d.size;
                        });

                    node = root = data;

                    var nodes = treemap.nodes(root);

                    var children = nodes.filter(function(d) {
                        return !d.children;
                    });

                    var parents = nodes.filter(function(d) {
                        return d.children;
                    });

                    // process parent nodes
                    parentCells = selection.selectAll("div.parent") 
                        .data(parents, function(d) {
                            return "p-" + d.name;
                        });

                    var parentEnterTransition = parentCells.enter()
                        .append("div")
                        .attr("class", "parent")
                        .each(enterHandler);

                    parentCells.exit().each(exitHandler).remove();

                    // process children nodes
                    childrenCells = selection.selectAll("div.child")
                        .data(children, function(d) {
                            return "c-" + d.name;
                        });

                    var childEnterTransition = childrenCells.enter()
                        .append("div")
                        .attr("class", "child")
                        .each(enterHandler);

                    childrenCells.exit().each(exitHandler).remove();

                    // set the padding for each child
                    treemap
                        .padding([10, 10, 10, 10])
                        .nodes(node);
                        
                    render();
                    animate();
                    transform();
                };
                
                var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
                directionalLight.position.set(-1000, -2000, 4000);
                _scene.add(directionalLight);
                
                // add subtle ambient lighting
                var ambientLight = new THREE.AmbientLight(0x313131);
                _scene.add(ambientLight);

                // control settings
                _controls = new THREE.TrackballControls(_camera, _renderer.domElement);
                _controls.staticMoving  = true;
                _controls.minDistance = 100;
                _controls.maxDistance = 6000;
                _controls.rotateSpeed = 1.5;
                _controls.zoomSpeed = 1.5;
                _controls.panSpeed = 0.5;
                _controls.addEventListener('change', render);
            }
            return Treemap3d;
        };
    }
};