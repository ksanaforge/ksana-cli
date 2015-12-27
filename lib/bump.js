var execSync = require('child_process').execSync;
module.exports=function(version){
	execSync("git tag "+version);
	execSync("git push --tags");
	execSync("npm publish");
}
