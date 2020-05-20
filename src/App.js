import React, { useEffect, useState } from 'react';
import 'rbx/index.css';
import {Card,Column,Image,Content,Level,Divider,Button} from 'rbx';

const Cards=({product})=>{
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
          {['S','M','L','XL'].map(size=><Button>
            {size}
          </Button>)}
        </Button.Group>
      </Card>
  )
}

const App = () => {
  const [data, setData] = useState({});
  const products = Object.values(data);
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  return (
    <Column.Group  >
      {[1, 2, 3, 4,].map(i => (
          <Column key={i}>
            {products.slice(4*(i-1),4*i).map(product=>
                <Level style={{display:"flex"}}>
                  <Cards product={product}/>
                </Level>
            )}
          </Column>
      ))}
    </Column.Group>
  );
}

export default App;
