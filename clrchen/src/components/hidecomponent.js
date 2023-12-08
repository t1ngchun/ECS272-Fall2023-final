import * as d3 from "d3";
export function hideMap(map_g, map_count_g) {
  if (map_g) {
    map_g.transition().duration(0).attr("opacity", 0);
  }
  if (map_count_g) {
    map_count_g.transition().duration(0).attr("opacity", 0);
  }
}
export function hideDots(circle_g) {
  if (circle_g) {
    circle_g.transition().duration(0).style("opacity", 0);
  }
}

export function hideHeatState(heat_state_g, legend, heat_rects) {
  if (heat_state_g) {
    heat_state_g.transition().duration(0).attr("opacity", 0);
    heat_rects.transition().duration(0).attr("opacity", 0);
    legend.transition().duration(0).attr("opacity", 0);
  }
}

export function hidePie(deceased_pie_g, shooting_pie_g, weapon_pie_g) {
  if (deceased_pie_g) {
    deceased_pie_g.transition().duration(0).attr("opacity", 0);
  }
  if (shooting_pie_g) {
    shooting_pie_g.transition().duration(0).attr("opacity", 0);
  }
  if (weapon_pie_g) {
    weapon_pie_g.transition().duration(0).attr("opacity", 0);
  }
}

export function hideMaptext(map_text_g) {
  if (map_text_g) {
    map_text_g.transition().duration(0).attr("opacity", 0);
  }
}
export function hideMapcount(map_count_g) {
  if (map_count_g) {
    map_count_g.transition().duration(0).attr("opacity", 0);
  }
}

export function hidePar(parallel_g) {
  if (parallel_g) {
    parallel_g.transition().duration(0).attr("opacity", 0);
  }
}

export function hideCompare(){
  d3.selectAll('.compare-title')
  .transition()
  .duration(0)
  .attr('opacity', 0);
}


export function hideText(){
  d3.selectAll("#textrect")
  .transition()
  .duration(0)
  .attr('opacity', 0);

  d3.selectAll("#text")
  .transition()
  .duration(0)
  .attr('opacity', 0);
}