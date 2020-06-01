exports.rand = function(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.distanceTo = function(pointA, pointB)
{
	let distanceX = pointA[0] - pointB[0],
		distanceY = pointA[1] - pointB[1]

	return Math.abs(Math.sqrt(distanceX * distanceX + distanceY * distanceY));
};