const { response } = require('express');
var express = require('express');
const pdtHelper = require('../product-Helper/pdtHelper');
var router = express.Router();
var productHelper=require('../product-Helper/pdtHelper')
var userHelper=require('../product-Helper/userHelper')



function verifyLogin(req,res,next){
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async(req, res, next)=> {
    let user=req.session.user
    let count=null
    if(req.session.user){
    count=await userHelper.getcount(req.session.user._id)
    }
  productHelper.getAllProduct().then((products)=>{
    let login=req.session.loggedIn
    console.log(products)
    res.render('index', {products,admin:false,user,login,count})
  })
//  let products =[
//     {
//     name:"Iphone",
//     discription:"THis is awesome",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
//   },
// {
//   name:"One plus",
//   discription:"Wow",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
// },
// {
//   name:"Hello",
//   discription:"SSKJSK",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
// },
// {
//   name:"Whan",
//   discription:"Sjksjks",
//   src:"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DypU?ver=351a&q=90&m=6&h=405&w=720&b=%23FFFFFFFF&l=f&o=t&aim=true"
// }]


  
});
router.get('/login',(req,res)=>{
     if(req.session.loggedIn){
       res.redirect('/')
     }else
     {
       
       res.render('./user/login',{loginErr:req.session.flag})
       req.session.flag=false
     }
    

})
router.get('/login/signup',(req,res)=>{
  res.render('./user/signup')
})
router.post('/login/signup',(req,res)=>{
  console.log(req.body)
  userHelper.getUserdata(req.body).then((Responses)=>{
    console.log(Responses);
  })
    res.render('user/signup')
  })
  router.post('/login',(req,res)=>{
    console.log(req.body)
    userHelper.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        res.redirect('/')

      }
      else{
        req.session.flag=true
        res.redirect('/login')
      }
    })
  })
  router.get('/logout',(req, res)=>{
    req.session.destroy()
    res.redirect('/')
  })
  router.get('/cart',verifyLogin,async(req, res)=>{
    
   let products=await userHelper.getProductToCart(req.session.user._id)
   let total=await userHelper.order(req.session.user._id)
   console.log(products)
   let user=req.session.user
   res.render('user/cart',{products,user,total})
  })
  router.get('/addToCart/:id',verifyLogin,(req, res)=>{
    let id=req.params.id
    let user=req.session.user._id
    pdtHelper.addToCart(user,id).then((response)=>{
      console.log(response)
      res.redirect('/')
    })


  })

  router.get('/remove/:id',(req, res)=>{
    console.log(req.params.id);
    userHelper.removeCart(req.params.id).then(()=>{
      res.redirect('/cart')
    })

  })
  router.get('/increment/:id',(req,res)=>{
    console.log("Item Id:"+req.params.id);
    console.log("UserID"+req.session.user._id);
    userHelper.increment(req.params.id,req.session.user._id).then(()=>{
      res.redirect('/cart')
    })
    
  })
  router.get('/decrement/:id',(req, res)=>{
    userHelper.decrement(req.params.id,req.session.user._id).then(()=>{
      res.redirect('/cart')
    })

    

  })
  router.get('/order', verifyLogin, async(req, res)=>{
    let total=await userHelper.order(req.session.user._id)
    user=req.session.user._id;
    res.render('user/order',{total,user})
  })
  router.post('/order',async(req, res)=>{
    let total=await userHelper.order(req.session.user._id)
    let products=await userHelper.getcartdetails(req.session.user._id)
    userHelper.orderchart(req.body,total,products).then((response)=>{
      res.json({status:true})
    })
  })
  router.get('/orderSuccess',(req,res)=>{
    user=req.session.user._id
    res.render('user/orderSuccess',{user})
    
  })
  // router.get('/OrderList',(req,res)=>{
  //   res.render('user/OrderList')
  // })
  router.get('/OrderList',async(req,res)=>{
    let order=await userHelper.viewOrder(req.session.user._id)
    let user=req.session.user;
    // console.log(order);
    res.render('user/OrderList',{order,user})
  })
  router.get('/viewOrderPdt/:id',async(req,res)=>{
    console.log("+orderId",req.params.id);
    let products=await userHelper.getOrderPdts(req.params.id);
    res.render('user/viewPdtOrder',{products});

  })
module.exports = router;
