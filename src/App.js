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

const Cards=({product,state})=>{
  const setShowShoppingcart=state.setShowShoppingcart;
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
            {product.title}
            <Divider>
              {product.price+'$'}
            </Divider>
              <Divider>
                {product.description}
              </Divider>
          </Content>
        </Card.Content>
        <Button.Group>
        {sizes.length >0 ?
          sizes.map(size=>
          <Button onClick={() => {
            setShowShoppingcart(true);
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

const CartCard = ({ product,size,count,state}) => {
  const setShowShoppingcart=Object.values(state)[1];
  const cartItems=Object.values(state)[2];
  const setCartItems=Object.values(state)[3];
  const stock=state.stock;
  const setStock=state.setDataInstock;
  return (
    <Card>
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
            newStock[product.sku][size]--;
            setStock(newStock);
          }else{
            alert("no more stock!");
          }
          setCartItems(cartItems.filter((cartItem) => {return cartItem.count>0}));}}>
          +
        </Button>
        <Button onClick={() => {
          let index=cartItems.findIndex((item)=>{return item.product === product && item.size === size});
          cartItems[index].count=0;
          setCartItems(cartItems.filter((cartItem) => {return cartItem.count>0}));}}>
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

  useEffect(() => {
    const handleData = snap => {
        if(snap.val()) setDataInstock(snap.val());
    }
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
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
        <Sidebar open={showShoppingCart} pullRight={true} styles={{ sidebar: { width: 300, background: "white" } }}
        sidebar={cartItems.map((cartItem,index)=>(
            <React.Fragment>
            <Button onClick={()=>setShowShoppingcart(!showShoppingCart)} size="large">
              🛒
            </Button>
            <Level>
                <CartCard product={cartItem.product} key={index} size={cartItem.size} count={cartItem.count} state={{showShoppingCart,setShowShoppingcart,cartItems,setCartItems}}/>
            </Level>
            </React.Fragment>
        ))}/>
      <Column.Group>
        {[1, 2, 3, 4,].map(i => (
          <Column key={i}>
            {products.slice(4*(i-1),4*i).map(product=>
              <Level style={{display:"flex"}}>
                <Cards product={product} state={{showShoppingCart,setShowShoppingcart,cartItems,setCartItems,stock:dataInstock,setDataInstock:setDataInstock}}/>
              </Level>
            )}
          </Column>
        ))}
      </Column.Group>
    </React.Fragment>
  );
}

export default App;
