# Loctome API - Terrain Elevation Service

![Elevation Service](images/elevation.png =80%x*)

This service is used to enrich coords with the terrain elevation data

If do you like use this service, please [Contact with us](https://loctome.com/web/english/contact-us) to request an api_key that allow.

## With Shapes Coords

	https://node.loctome.com/height?json={"shape":[{"lat":40.712431,"lng":-76.504916},{"lat":40.712275,"lng":-76.605259}]}&api_key=elevation_api_key

	Test [Link](https://node.loctome.com/height?json={%22shape%22:[{%22lat%22:40.712431,%22lng%22:-76.504916},{%22lat%22:40.712275,%22lng%22:-76.605259}]}&api_key=elevation_api_key)

![Shape](images/shape.png =80%x*)

## With Encoded Coords

	You could be send multiple coords as compressed-encoded format

	https://node.loctome.com/height?json={"encoded":"morjnAme`eB?`A\\`@f@`A\\`@d@bB\\bBbAbBbB^bB`@~B?hC?`C`@bA`A?dCcAbBaC?gDeCaBiGcBiFcBeDgCcBgD?aCbBcAbB?`A`B`AhC`@bB?bA`@\\^]bAkB^aB_@aCcAkGaAaB`@e@^]bA\\?d@^?`@\\`@?^d@??_@\\cA^_@d@?\\^bA?|@?bA?d@?^??`@\\`@?^?`@?`@\""}&api_key=elevation_api_key

	Test [Link](https://node.loctome.com/height?json={%22encoded%22%3A%22morjnAme%60eB%3F%60A%5C%5C%60%40f%40%60A%5C%5C%60%40d%40bB%5C%5CbBbAbBbB%5EbB%60%40~B%3FhC%3F%60C%60%40bA%60A%3FdCcAbBaC%3FgDeCaBiGcBiFcBeDgCcBgD%3FaCbBcAbB%3F%60A%60B%60AhC%60%40bB%3FbA%60%40%5C%5C%5E%5DbAkB%5EaB_%40aCcAkGaAaB%60%40e%40%5E%5DbA%5C%5C%3Fd%40%5E%3F%60%40%5C%5C%60%40%3F%5Ed%40%3F%3F_%40%5C%5CcA%5E_%40d%40%3F%5C%5C%5EbA%3F%7C%40%3FbA%3Fd%40%3F%5E%3F%3F%60%40%5C%5C%60%40%3F%5E%3F%60%40%3F%60%40%5C%22%22}&api_key=elevation_api_key)

![Encoded](images/encoded.png =80%x*)

## Compress Encode javascript example code:

	@points = array of values lat1, lng1, lat2, lng2,...
	@precision = Number between 1 and 8, represent the decimal precision. i.e. 6 = 23.412345

	function compress(points, precision) {
		try {
			var oldLat = 0,
				oldLng = 0,
				len = points.length,
				index = 0,
				encoded = '';
			
			precision = Math.pow(10, precision);
			while (index < len) {
				//  Round to N decimal places
				var lat = Math.round(points[index++] * precision);
				var lng = Math.round(points[index++] * precision);

				//  Encode the differences between the points
				encoded += encodeNumber(lat - oldLat);
				encoded += encodeNumber(lng - oldLng);

				oldLat = lat;
				oldLng = lng;
			}
			return encoded;
		} catch (err) {
			msg(err);
		}
	}
	
## Swagger API Definition

Access to the Swagger API defintion in the folow [Link](https://editor.swagger.io/?url=https://node.loctome.com/swagger/elevation.yaml) 

![openapi](images/swagger.png =80%x*)