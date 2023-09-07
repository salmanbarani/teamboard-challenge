import { app } from './app';
import { setupSwagger } from "./swagger/swagger";




const start = () => {

  const port = process.env.PORT || 8080;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
}


start();