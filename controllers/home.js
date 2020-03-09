var express = require('express');
var router = express.Router();
var userModel = require.main.require('./models/user-model');
var propertyModel = require.main.require('./models/property-model');
var messageModel = require.main.require('./models/message-model');
var userModel1   = require.main.require('./model/user-model1');
var multer=require('multer');

var storage= multer.diskStorage({

	destination: function(req,file,cb){
		cb(null,'public/')
	},
	filename: function(req,file,cb){
		cb(null,Date.now() + file.originalname)
	}

})
var upload=multer({storage: storage})

router.use(express.static('./public'))
router.use('/abc', express.static('xyz'));



router.get('*', function(req, res, next){
	if(req.cookies['username'] == null){
		res.redirect('/login');
	}else{
		next();
	}
});

router.get('/', function(req, res){
	userModel.getByUsername(req.cookies['username'], function(result){
		propertyModel.getAllPendingPosts(function(results){
			res.render('home/index', {user: result, propertylist: results});
		});
		
	});
});

router.get('/allow/:property_id', function(req, res){
	propertyModel.allow(req.params.property_id, function(status){
		if (status) {
			res.redirect('/home');
		} else{
			res.send("Allowing this post made some error");
		}
	});
});

router.get('/deny/:property_id', function(req, res){
	propertyModel.deny(req.params.property_id, function(status){
		if (status) {
			res.redirect('/home');
		} else{
			res.send("Denying this post made some error");
		}
	});
});


router.get('/view_users', function(req, res){
	
		userModel.getAllCustomer(function(results){
			if(results.length > 0){
				res.render('home/view_users', {userlist: results});
			}else{
				res.redirect('/home');
			}
		});
});

router.post('/view_users', function(req, res){
		var user = {
			username: req.body.username,
			email: req. body.email,
			type: req.body.type,
			orderby: req.body.orderby
		};

		userModel.searchCustomer(user, function(results){
			if(results.length >= 0){
				res.render('home/view_users', {userlist: results});
			}else{
				res.redirect('/home');
			}
		});
});

router.get('/edit/:customer_id', function(req, res){
	userModel.getByCustomerId(req.params.customer_id, function(result){
		res.render('home/edit', {user: result});
	});
});

router.post('/edit/:customer_id', function(req, res){
	
		var user = {
			id: req.params.customer_id,
			username: req.body.username,
			password: req.body.password,
			type: req.body.type,
			phone: req.body.phone
		};

		userModel.update(user, function(status){
			if(status){
				res.redirect('/home/view_users');
			}else{
				res.redirect('/home/edit/'+req.params.customer_id);
			}
		});
});

router.get('/addUser', function(req, res){
	userModel.getByUsername(req.cookies['username'], function(result){
		res.render('home/addUser', {user: result});
	});
});

router.post('/addUser', function(req, res){

	var user ={
		username: req.body.uname,
		name: req.body.name,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		type: req.body.type,
		phone: req.body.phone,
		email: req.body.email
	};

	if (!user.username) {
		res.send('Username cannot be empty');
	} else {
		if (!user.password) {
			res.send('Password cannot be empty');
		} else {
			if(user.email){
				if (user.phone) {
					userModel.validateUsername(user.username, function(status){
				 	if(!status){
						if (user.password == user.confirmPassword) {
							userModel.insertUser(user, function(status1){
								if (status1) {
									res.redirect('/registration/addUserSuccess');
								}else{
									res.send('Registration has not benn completed');
								}
							})
						}else{
							res.send('Confirm Password did not match');
						}
					}else{
						res.send('Username already exists');
					}
					});
				} else {
					res.send('Phone cannot be empty');
				}
			}else{
				res.send('Email cannot be empty');
			}
		}
	}
	
});

router.get('/delete/:customer_id', function(req, res){
	
	userModel.getByCustomerId(req.params.customer_id, function(result){
		res.render('home/delete', {user: result});
	});
})

router.post('/delete/:customer_id', function(req, res){
	
	userModel.delete(req.params.customer_id, function(status){
		if(status){
			res.redirect('/home/view_users');
		}else{
			res.redirect('/home/delete/'+req.params.customer_id);
		}
	});
});

router.get('/view_property', function(req, res){
	
		propertyModel.getAllProperty(function(results){
			if(results.length > 0){
				res.render('home/view_property', {propertylist: results});
			}else{
				res.redirect('/home');
			}
		});
});

router.get('/view_property_detail/:property_id', function(req, res){
	propertyModel.getByPropertyId(req.params.property_id, function(result){
		res.render('home/view_property_detail', {property: result});
	});
});

router.get('/delete_property/:property_id', function(req, res){
	propertyModel.getByPropertyId(req.params.property_id, function(result){
		res.render('home/delete_property', {property: result});
	});
});

router.post('/delete_property/:property_id', function(req, res){
	
	propertyModel.delete(req.params.property_id, function(status){
		if(status){
			res.redirect('/home/view_property');
		}else{
			res.redirect('/home/delete/'+req.params.property_id);
		}
	});
});

router.get('/user_detail/:username', function(req, res){
	userModel.getByUsername(req.params.username, function(result){
		messageModel.getByUsernameFrom(req.params.username, function(results){
			res.render('home/user_detail', {user: result, messagelist: results});
		});
	});
});

router.get('/user_active_posts/:username', function(req, res){
	propertyModel.getActivePosts(req.params.username, function(result){
		res.render('home/user_active_posts', {propertylist: result});
	});
});

router.get('/user_pending_posts/:username', function(req, res){
	propertyModel.getPendingPosts(req.params.username, function(result){
		res.render('home/user_pending_posts', {propertylist: result});
	});
});

router.get('/user_sold_posts/:username', function(req, res){
	propertyModel.getSoldPosts(req.params.username, function(result){
		res.render('home/user_sold_posts', {propertylist: result});
	});
});

router.get('/user_total_posts/:username', function(req, res){
	propertyModel.getByUsername(req.params.username, function(result){
		res.render('home/user_total_posts', {propertylist: result});
	});
});

router.post('/view_property', function(req, res){
	var property = {
	    title: req.body.title,
	    location: req.body.location,
	    bed: req.body.bed,
	    bath: req.body.bath,
	    floor: req.body.floor,
	    price_from: req.body.price_from,
	    price_to: req.body.price_to,
	    purpose: req.body.purpose,
	    type: req.body.type,
	    status: req.body.status,
	    orderby: req.body.orderby
	};
	
	propertyModel.searchProperty(property, function(results){
		if(results.length >= 0){
			res.render('home/view_property', {propertylist: results});
		}else{
			res.redirect('/home');
		}
	});
});

router.get('/view_message', function(req, res){
	
		messageModel.getAllMessage(function(results){
			if(results.length >= 0){
				res.render('home/view_message', {messagelist: results});
			}else{
				res.redirect('/home');
			}
		});
});

router.post('/view_message', function(req, res){
		var message = {
			from: req.body.from,
			to: req. body.to,
			msg: req.body.msg,
			orderby: req.body.orderby
		};

		messageModel.searchMessage(message, function(results){
			if(results.length >= 0){
				res.render('home/view_message', {messagelist: results});
			}else{
				res.redirect('/home');
			}
		});
});


///////////////////////////////////////abdullah///////////////////////////////////////////


//home

router.get('/Customer_Home', function(req, res){	
	
		userModel1.getAllc(function(results){
			if(results.length > 0)
			{
			      res.render('home/Customer_Home', {propertylist: results});
		    }
		    else
		    {
			 res.redirect('home/Customer_Home ',{propertylist: results});
		    }
			
		});
	
});



//profile
router.get('/Customer_Profile', function(req, res){



     var user=
     {
     	username: req.cookies['username']
     };
	//if(req.cookies['username'] != null){
			        userModel1.getProfile(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Customer_Profile', {profile: results});
		    }
		     else
		    {
			 //res.redirect('Customer_Home');
			   res.redirect('home/Customer_Home');
		    }
		   
		});
	  // }

	  

});




//FeedBack

router.get('/Customer_Feedback', function(req, res){

	var user=
     {
     	username: req.cookies['username']
     };
	
			        userModel1.getFeedback(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Customer_Feedback', {feedback: results});
		    }
		     else
		    {
			 res.redirect('Customer_Feedback_empty');
			   
		    }
		   
		});
	
});


//Feedback_empty

router.get('/Customer_Feedback_empty', function(req, res){
	
		res.render('home/Customer_Feedback_empty');	       
	
});


router.post('/Customer_Feedback', function(req, res){

	var user=
     {
     	username: req.cookies['username'],
     	msg: req.body.feedback
     };
	
			   userModel1.addFeedback(user,function(status){

		
			if(status)
			{
			      res.redirect('/home/Customer_Feedback');
		    }
		     else
		    {
			 res.redirect('Customer_Feedback_empty');
			   
		    }
		   
		});
	
});




//Customer_upload
router.get('/Customer_Upload', function(req, res){
	
	 var user=
     {
     	username: req.cookies['username']
     };
	
			        userModel1.getProfile(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Customer_Upload', {profile: results});
		    }
		     else
		    {
			 //res.redirect('Customer_Home');
			   res.redirect('home/Customer_Upload');
		    }
		   
		});
});


router.post('/Customer_Upload',upload.single('image'),function(req,res,next){
       //var fileinfo=req.file.filename;
       var user=
      {
     	username: req.cookies['username'],
     	title: req.body.title,
        property_area :req.body.place,
        type: req.body.type,
        style: req.body.style,
        property_price: req.body.price,
        bed: req.body.bed,
        bath: req.body.bath,
        feet: req.body.feet,
        floor: req.body.floor,
        description: req.body.description,
        image:req.file.filename
      };
       userModel1.UploadProperty(user,function(status){

		
			if(status)
			{
			      res.redirect('/home/Customer_Edit');
		    }
		     else
		    {
			 
			   res.redirect('/home/Customer_Upload');
		    }
		   
		});
})



//Customer_Uploaded
router.get('/Customer_All_Upload', function(req, res){

	
var user=
     {
     	username: req.cookies['username']
     };
	
			        userModel1.getProperty3(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Customer_All_Upload', {propertylist: results});
		    }
		     else
		    {
			 
			   res.redirect('/home/Customer_Home');
		    }
		   
		});
	 
	  

});



//Customer_edit
router.get('/Customer_Edit', function(req, res){

	
var user=
     {
     	username: req.cookies['username']
     };
	
			        userModel1.getProperty2(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Customer_Edit', {propertylist: results});
		    }
		     else
		    {
			 
			   res.redirect('/home/Customer_Home');
		    }
		   
		});
	 
	  

});


//Customer_Sold/Rent

router.get('/Customer_Edit/:property_id', function(req, res){

	
var user=
     {
     	username:req.cookies['username'],
     	id:req.params.property_id
     };
	
	userModel1.UpdateStatus(user,function(status){

		
			if(status)
			{
			      res.redirect('/home/Customer_Edit');
		    }
		     else
		    {
			 
			   res.redirect('/home/Customer_Home');
		    }
		   
		});
	 
	  

});




//Customer_Delete
router.get('/Customer_Delete', function(req, res){
	
	var user=
     {
     	username: req.cookies['username']
     };
	//if(req.cookies['username'] != null){
			        userModel1.getProperty2(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Customer_Delete', {propertylist: results});
		    }
		     else
		    {

			 res.redirect('/home/Customer_Home');

		    }
		   
		});
	  // }

});


router.get('/Customer_Delete/:property_id', function(req, res){
	
	var user = {
		id: req.params.property_id,
		username: req.cookies['username']
	};

	userModel1.customerdelete(user, function(status){
		if(status){
			res.redirect('/home/Customer_Delete');
		}else{
			res.render('home/Customer_Delete/'+req.params.id);
		}
	});
})






//Change_Password

router.get('/Change_Password', function(req, res){
var user=
     {
     	username: req.cookies['username']
     };
	
			        userModel1.getProfile(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Change_Password', {profile: results});
		    }
		     else
		    {
			 
			   res.redirect('home/Change_Password');
		    }
		   
		});
});

router.post('/Change_Password', function(req, res){

	if( req.body.npass==req.body.cpass){
var user=
     {
     	npass: req.body.npass,
     	
     	username: req.cookies['username']
     };
	
			 userModel1.UpdatePassword(user,function(status){

		
			if(status)
			{

			      res.redirect('/login');
		    }
		     else
		    {
			 
			   res.redirect('home/Change_Password');
		    }
		   
		});

			}


   else{
        
        req.checkBody('cpass','Passwords do not match.').equals(req.body.npass);
   	    const err = req.validationErrors();

   	    if(err)
   	    {		

                res.render('home/Change_Password', {errors: err});

        }
        else
   		res.redirect('/home/Change_Password');
   }
   
});





//Customer_Edit_F
router.get('/Customer_Edit_F/:property_id', function(req, res){
	var user = {
		id: req.params.property_id
	};

	userModel1.getProperty(user, function(results){
		if(results.length > 0){
			res.render('home/Customer_Edit_F', {profile: results});
		}else{
			res.redirect('/home/Property_Edit_F/'+req.params.id);
		}
	});
});

router.post('/Customer_Edit_F/:property_id',upload.single('image'), function(req, res){
	var user = {
		id: req.params.property_id,
		username: req.cookies['username'],
     	title: req.body.title,
        property_area :req.body.place,
        type: req.body.type,
        style: req.body.style,
        property_price: req.body.price,
        bed: req.body.bed,
        bath: req.body.bath,
        feet: req.body.feet,
        floor: req.body.floor,
        description: req.body.description
        
	};

	userModel1.editProperty(user, function(status){
		if(status){
			res.redirect('/home/Customer_Edit_F');
		}else{
			res.redirect('/home/Property_Edit_F/'+req.params.id);
		}
	});
});









//Property_details
router.get('/Property_details/:property_id', function(req, res){
	var user = {
		id: req.params.property_id
	};

	userModel1.getProperty(user, function(results){
		if(results.length > 0){
			res.render('home/Property_details', {propertylist: results});
		}else{
			res.redirect('/home/Property_details/'+req.params.id);
		}
	});
});

router.post('/Property_details/:property_id', function(req, res){
	
	var user = {
		id: req.params.property_id
	};

	userModel1.getProperty(user, function(results){
		if(results.length > 0){
			res.render('home/Property_details', {propertylist: results});
		}else{
			res.redirect('/home/Property_details/'+req.params.property_id);
		}
	});
})





//Customer_Edit_Profile

router.get('/Customer_Edit_Profile', function(req, res){

   
     var user=
     {
     	username: req.cookies['username']
     };
	
			        userModel1.getProfile(user,function(results){

		
			if(results.length > 0)
			{
			      res.render('home/Customer_Edit_Profile', {profile: results});
		    }
		     else
		    {
			 
			   res.redirect('home/Customer_Home');
		    }
		   
		});
});

router.post('/Customer_Edit_Profile', function(req, res){

   
     var user=
     {
     	id:req.body.id,
     	username:req.cookies['username'],
     	name:req.body.name,
     	email:req.body.email,
     	phone:req.body.phone
     };
	
			userModel1.updateProfile(user,function(status){

		
			if(status)
			{
			      res.redirect('/home/Customer_Profile');
		    }
		     else
		    {
			 
			   res.redirect('home/Customer_Home');
		    }
		   
		});
});

module.exports = router;