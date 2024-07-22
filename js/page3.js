const tooltip = d3.select("body").append("div").attr("class", "tooltip");

d3.csv("data.csv").then(function(data) {
    // Convert string data to numbers where needed
    data.forEach(function(d) {
        d.Gross = parseInt(d.Gross.replace(/,/g, ''));
        d.Year = +d.Year;  // Ensure Year is treated as a number
    });

    // Group data by director
    const dataByDirector = d3.group(data, d => d.Director);

    // Dimensions
    const margin = { top: 50, right: 50, bottom: 100, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scaleLog()
        .base(10)
        .domain([d3.min(data, d => d.Gross), d3.max(data, d => d.Gross)])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#line-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create the x and y axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d => d3.format("$.2s")(d));

    // Append x and y axes
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Year")
        .style("font-family", "Arial")
        .style("font-size", "12px");

    svg.append("g")
        .call(yAxis)
        .append("text")
        .attr("y", -60)
        .attr("x", -height / 2)
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Gross Earnings")
        .style("font-family", "Arial")
        .style("font-size", "12px");

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Gross));

    // Draw lines for each director
    dataByDirector.forEach((values, key) => {
        svg.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", colorScale(key))
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add a legend
        svg.append("text")
            .attr("x", width - margin.right)
            .attr("y", height - margin.bottom - 20 * dataByDirector.size + 20 * dataByDirector.size)
            .attr("fill", colorScale(key))
            .style("font-size", "12px")
            .style("font-family", "Arial")
            .text(key);
    });

    // Tooltip functionality
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Gross))
        .attr("r", 3)
        .attr("fill", d => colorScale(d.Director))
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("display", "block");
            tooltip.html(`<strong>Director: ${d.Director}</strong><br>
                Year: ${d.Year}<br>
                Gross Earnings: $${d3.format(",.0f")(d.Gross)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("display", "none");
        });
});
