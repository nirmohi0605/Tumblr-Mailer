var fs = require("fs");
var ejs = require('ejs');
var tumblr = require('tumblr.js');

var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var template = fs.readFileSync('email_template.ejs', 'utf-8');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('xxxxxxxxxxxxxxx');


var client = tumblr.createClient({
  consumer_key: "xxxxxxxxxxxxxxxxxxxxxx",
  consumer_secret: "xxxxxxxxxxxxxxxxxxxxxx",
  token: "xxxxxxxxxxxxxxxxxxxxxx",
  token_secret: "xxxxxxxxxxxxxxxxxxxxxx"
});




var csvParse = function(file){
	var contacts = file.split("\n");
	for (i in contacts) contacts[i] = contacts[i].split(',');
	contacts.shift();
	var contactArray = contacts;
	var contactList = [];

	//constructor function that makes an object with contact keys
	function ObjectArray(firstName, lastName, numMonthsSinceContact, email){
		this.firstName = firstName;
		this.lastName = lastName;
		this.numMonthsSinceContact = numMonthsSinceContact;
		this.email = email;
	};

	
	for (i in contactArray){
		var contact = new ObjectArray(contactArray[i][0], contactArray[i][1], contactArray[i][2], contactArray[i][3]);
		contactList.push(contact);
	};
	return contactList;
};


client.posts('bsb91.tumblr.com', function(err, blog){
	if (err) throw err;

	
	var latestPosts = blog.posts.filter(function(post) {
		var sevenDays = 24 * 60 * 60 * 1000; 
		var postDate = new Date(post.date);
		var dateNow = new Date();
		return (dateNow - postDate)/sevenDays <= 7;
	});

var csvData = csvParse(csvFile);

	csvData.forEach(function(person) {
		var object = {
			firstName: person.firstName, 
			numMonthsSinceContact: person.numMonthsSinceContact,
			latestPosts: latestPosts}
		var customizedTemplate = ejs.render(template, object);
		
		sendEmail(person.firstName, person.emailAddress, 'Nirmohi', 'nirmohi0605@gmail.com', "Testing123", customizedTemplate);
	});
});




function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
	    "html": message_html,
	    "subject": subject,
	    "from_email": from_email,
	    "from_name": from_name,
	    "to": [{
	            "email": to_email,
	            "name": to_name
	        }],
	    "important": false,
	    "track_opens": true,    
	    "auto_html": false,
	    "preserve_recipients": true,
	    "merge": false,
	    "tags": [
	        "Fullstack_Tumblrmailer_Workshop"
	    ]    
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
	    	      
	}, function(e) {
	    // Mandrill returns the error as an object with name and message keys
	    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}