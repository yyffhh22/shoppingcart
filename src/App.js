import React, { useEffect, useState } from 'react';
import 'rbx/index.css';
import {Card,Column,Image,Content,Level,Divider,Button,Navbar,Media,Title,Message} from 'rbx';
import Sidebar from 'react-sidebar';
import db from './Components/db';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const Cards=({product,state,user})=>{
  const setShowShoppingcart=state.setShowShoppingcart;
  const showShoppingCart=state.showShoppingCart;
  const cartItems=state.cartItems;
  const setCartItems=state.setCartItems;
  const stock=state.stock;
  const setDataInstock=state.setDataInstock;
  const sizes=["S","M","L","XL"].filter((key) => {
    if (!stock) return true;
    if (!stock[product.sku]) return true;
    return stock[product.sku][key]>0
  });
  return(
      <Card key={product.sku} style={{height:"100%", display:"flex", flexDirection:"column"}}>
        <Card.Image>
          <Image.Container >
            <Image src={require('../public/data/products/'+product.sku+'_1.jpg')} />
          </Image.Container>
        </Card.Image>
        <Card.Content>
          <Content>
            <Message>
              <Message.Header color="light">
                  {product.title}
              </Message.Header>
              <Message.Body color="info">
            <Divider>
              {product.price+'$'}
            </Divider>
              <Divider>
                {product.description}
              </Divider>
              </Message.Body>
            </Message>
          </Content>
        </Card.Content>
        <Button.Group align="centered">
        {sizes.length >0 ?
          sizes.map(size=>
          <Button onClick={() => {
            setShowShoppingcart(!showShoppingCart);
            let index=cartItems.findIndex((item)=>{return item.product === product && item.size === size});
              if (index !==-1){
                cartItems[index].count++;
              }else{
                cartItems.push({product: product,size:size,count:1});
              }
            let newstock=stock;
            newstock[product.sku][size]--;
            setDataInstock(newstock);
            setCartItems(cartItems);
            if (user) {
              db.child('carts').child(user.uid).set(cartItems)
                .catch(error => alert(error));
            }
          }}>
          {size}</Button>) : 
          <Button>
            OUT OF STOCK
          </Button>
          }
        </Button.Group>
        <Button >
          Add to Cart
        </Button>
      </Card>
  )
}

const CartCard = ({ product,size,count,state,user}) => {
  const setShowShoppingcart=Object.values(state)[1];
  const cartItems=Object.values(state)[2];
  const setCartItems=Object.values(state)[3];
  const stock=state.stock;
  const setStock=state.setDataInstock;
  return (
    <Card style={{width:"475px", height:"200px"}}>
      <Card.Content>
        <Media>
          <Media.Item as="figure" align="left">
            <Image.Container as="p" size={64}>
              <Image
                src={require('../public/data/products/'+product.sku+'_2.jpg')}
              />
            </Image.Container>
          </Media.Item>
          <Media.Item>
            <Title as="p" size={4}>
              {product.title}
            </Title>
            <Title as="p" subtitle size={6}>
              {count} x {size} - ${parseFloat(count*product.price).toFixed(2)}
            </Title>
          </Media.Item>
        </Media>
        <Button onClick={() => {
          let index=cartItems.findIndex((item)=>{return item.product === product && item.size === size});
          let newStock=stock;
          if (newStock[product.sku][size]>0){
            cartItems[index].count++;
            for (var key in stock) {
              if (String(key) !== String(product.sku)) newStock[key] = stock[key];
              else {
                newStock[key] = stock[key];
                newStock[key][size]-=1;
              }
            }
            setStock(newStock);
            setCartItems(cartItems.filter((cartItem) => {return cartItem.count>0}));
            if (user) {
              db.child('carts').child(user.uid).set(cartItems)
                .catch(error => alert(error));
            }
          }else{
            alert("no more stock!");
          }
          }}>
          +
        </Button>
        <Button onClick={() => {
          let index=cartItems.findIndex((item)=>{return item.product === product && item.size === size});
          var temp = cartItems[index].count;
          let newStock=stock;
          for (var key in stock) {
            if (String(key) !== String(product.sku)) newStock[key] = stock[key];
            else {
              newStock[key] = stock[key];
              newStock[key][size] += temp;
            }
          }   
          setStock(newStock);
          cartItems[index].count=0;
          setCartItems(cartItems.filter((cartItem) => {return cartItem.count>0}));
          if (user) {
            db.child('carts').child(user.uid).set(cartItems)
              .catch(error => alert(error));
          }
        }}>
          Remove Items
        </Button>
      </Card.Content>
    </Card>
  );
};


const App = () => {
  const [data, setData] = useState({});
  const products = Object.values(data);
  const [showShoppingCart,setShowShoppingcart]=useState(false);
  const [cartItems,setCartItems]=useState([]);
  const [dataInstock,setDataInstock]=useState({});
  const [user, setUser] = useState(null);
  var total=0.0;

  const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false
    }
  };

  const Welcome = ({ user }) => (
    <Message color="info">
      <Message.Header>
        Welcome, {user.displayName}
        <Button primary onClick={() => firebase.auth().signOut()}>
          Log out
        </Button>
      </Message.Header>
    </Message>
  );
  const SignIn = () => (
    <StyledFirebaseAuth
      uiConfig={uiConfig}
      firebaseAuth={firebase.auth()}
    />
  );

  cartItems.forEach((item) => {total += item.product.price * item.count})
  useEffect(() => {
    const handleData = snap => {
        if(snap.val()) setDataInstock(snap.val());
    }
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  const mergeCarts = ({user, pulledCart}) => {
    const newCart = pulledCart;
    const fixed = pulledCart;
    const currentCart = cartItems;
    for(let i = 0; i < currentCart.length; i++){
      let newItem = true;
      for(let j = 0; j < fixed.length; j++){
        if (currentCart[i].itemId === newCart[j].itemId){
          newItem = false;
          newCart[j].qty += 1;
          break;
        }
      }
      if (newItem){
        newCart.push(currentCart[i])
      }
    }
    setCartItems(newCart)
    db.child('carts').child(user.uid).set(newCart)
  }

  const userUpdateFunc = (user) => {
    if(user){
      const db2 = firebase.database().ref('carts/' + user.uid);
      const handleData2 = snap => {
        if(snap.val()){
          const pulledCart = snap.val()
          mergeCarts({user, pulledCart});
        }
        else{
          db.child('carts').child(user.uid).set(cartItems)
        }
        db2.off('value', handleData2);
      }
      db2.on('value', handleData2, error => alert(error));
    }
    setUser(user);
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged(userUpdateFunc);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
        const responseI = await fetch('./data/products.json');
        const jsonI = await responseI.json();
        setData(jsonI);
    };
    fetchProducts();
    // fetchStock();
  }, []);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);
  
  return (
    <React.Fragment>
      <Navbar>
        <Navbar.Brand>
          <Navbar.Item>
            <Title>Shopping Cart</Title>
          </Navbar.Item>
        </Navbar.Brand>
        <Navbar.Menu>
        <Navbar.Segment align="end">
          <Navbar.Item>
            <Button.Group>
              { user ? <Welcome user={ user } /> : <SignIn /> }
              <Button onClick={()=>setShowShoppingcart(!showShoppingCart)} size="large">
                🛒
              </Button>
            </Button.Group>
          </Navbar.Item>
        </Navbar.Segment>
        </Navbar.Menu>
      </Navbar>
      <Sidebar open={showShoppingCart} pullRight={true} styles={{ sidebar: { background: "white" ,paddingTop:"50px",psoition:"fixed"} }} sidebar=
        {<React.Fragment>
          <Message>
            <Message.Header>
              <p> total price</p>
            </Message.Header>
            <Message.Body>
              ${parseFloat(total).toFixed(2)}
            </Message.Body>
          </Message>
        {cartItems.map((cartItem,index) =>(
          <Level>
              <CartCard product={cartItem.product} key={index} user={user} size={cartItem.size} count={cartItem.count} state={{showShoppingCart,setShowShoppingcart,cartItems,setCartItems,stock:dataInstock,setDataInstock:setDataInstock}}/>
          </Level>
        ))}
        <Button disabled align="center">
          Checkout
        </Button>
        </React.Fragment>}
        />
      <Column.Group>
        {[1, 2, 3, 4,].map(i => (
          <Column key={i}>
            {products.slice(4*(i-1),4*i).map(product=>
              <Level style={{display:"flex"}}>
                <Cards product={product} user={user} state={{showShoppingCart,setShowShoppingcart,cartItems,setCartItems,stock:dataInstock,setDataInstock:setDataInstock}}/>
              </Level>
            )}
          </Column>
        ))}
      </Column.Group>
    </React.Fragment>
  );
}

export default App;
