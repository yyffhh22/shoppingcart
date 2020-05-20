import React, { useEffect, useState } from 'react';
import 'rbx/index.css';
import {Card,Column,Image,Content,Level,Divider,Button,Navbar,Media,Title} from 'rbx';
import Sidebar from 'react-sidebar';

const Cards=({product,state})=>{
  const setShowShoppingcart=Object.values(state)[1];
  const cartItems=Object.values(state)[2];
  const setCartItems=Object.values(state)[3];
  return(
      <Card key={product.sku}>
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
          {['S','M','L','XL'].map(size=>
            <Button onClick={() => {
              setShowShoppingcart(true);
              cartItems.push(product);
              setCartItems(cartItems);
            }}>
            {size}
            </Button>)}
        </Button.Group>
        <Button >
          Add to Cart
        </Button>
      </Card>
  )
}

const CartCard = ({ item }) => {
  return (
    <Card>
      <Card.Content>
        <Media>
          <Media.Item as="figure" align="left">
            <Image.Container as="p" size={64}>
              <Image
                src={require('../public/data/products/'+item.sku+'_2.jpg')}
              />
            </Image.Container>
          </Media.Item>
          <Media.Item>
            <Title as="p" size={4}>
              {item.title}
            </Title>
            <Title as="p" subtitle size={6}>
              {item.price}
            </Title>
          </Media.Item>
        </Media>
      </Card.Content>
    </Card>
  );
};


const App = () => {
  const [data, setData] = useState({});
  const products = Object.values(data);
  const [showShoppingCart,setShowShoppingcart]=useState(false);
  const [cartItems,setCartItems]=useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  return (
    <React.Fragment>
      <Navbar>
        <Navbar.Brand>
          Nu-Shopping Cart
        </Navbar.Brand>
        <Navbar.Menu>
          <Navbar.Segment align="end">
            <Button onClick={()=>{setShowShoppingcart(! showShoppingCart)}} size="large">
              🛒
            </Button>
          </Navbar.Segment>
        </Navbar.Menu>
      </Navbar>
        <Sidebar open={showShoppingCart} pullRight={true} styles={{ sidebar: { background: "black" } }}
        sidebar={cartItems.map(cartItem =>(
            <Level>
                <CartCard item={cartItem}/>
            </Level>
        ))}/>
      <Column.Group>
        {[1, 2, 3, 4,].map(i => (
          <Column key={i}>
            {products.slice(4*(i-1),4*i).map(product=>
              <Level style={{display:"flex"}}>
                <Cards product={product} state={{showShoppingCart,setShowShoppingcart,cartItems,setCartItems}}/>
              </Level>
            )}
          </Column>
        ))}
      </Column.Group>
    </React.Fragment>
  );
}

export default App;
