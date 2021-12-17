import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css';

class JokeList extends React.Component {
  static defaultProps = {
    numJokesToGet: 10 /* Numero de jokes por cada request a la API */
  };
  constructor(props) {
    super(props);
    this.state = { 
      // jokes: asigna a jokes el item (jokes) que hay en localStorage ó (||) asigna un arreglo vacio "[]"
      // parsea(item "jokes" en localStorage, si esta vacio, parsea "[]") y asignalo a jokes
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]") ,
      loading: false // estado inicial para saber si estamos cargando datos
    }; 
    // seenJokes contendra el set de jokes (solo el texto (text), para verificar con el metodo has si ya existe el joke L40)
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    /* console.log(this.seenJokes); */
    this.handleClick = this.handleClick.bind(this);
  }
  /* Al iniciar el componente (despues del primer render), hacemos la consulta asincrona */
  componentDidMount(){
    // si jokes es igual a vacio, significa que no hay jokes en localstorage, llamamos a la API con getJokes
    if (this.state.jokes.length === 0) this.getJokes();
    // se hace asi para no sobreescribir jokes que esten en localstorage
  }
  // consulta a la API 
  async getJokes(){
    try{
      // cargar jokes
      let jokes = []; /* arreglo jokes vacio, aqui cargaremos la data de la API */
      while (jokes.length < this.props.numJokesToGet) { /* mientras la longitud de jokes sea menor que el valor de la propiedad numJokesToget */
        // con axios (puede ser fetch nativo de JS) hacemos la peticion
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" } // para esta API, requerimos indicarle la cabecera, que tipo necesitamos
        });
        let newJoke = res.data.joke;
        if(!this.seenJokes.has(newJoke)){ // verificamos si el joke no existe
          // a nuestro arreglo vacio, iremos metiendo cada joke devuelto, ademas de generar un ID y para votes = 0 por defecto
          jokes.push({ id: uuidv4(), text: newJoke, votes: 0});
        } else{
          console.log("SE ENCONTRO UN DUPLICADO");
          console.log(newJoke);
        }  
      }    
      // al terminar de llenar nuestro arreglo (en el bucle while), asignamos (setState) a nuestra propiedad jokes el arreglo con la data
      this.setState(
        st => ({
          loading: false, // cambiamos a falso la carga, es decir, terminamos de cargar los jokes
          // a la propiedad jokes, le asignamos (setState) el estado actual de jokes (..st.jokes)
          // y los jokes que recibimos en wl bucle while (unimos ...st.jokes y ...jokes en un arreglo)
          jokes: [...st.jokes, ...jokes]
        }),
        // ya que se actualizo el estado de jokes, guardamos en localStorage ese estado (this.state.jokes)
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    }catch(e){
      alert(e);
      this.setState({loading: false});
    }
  }
  // asignamos votos (voto por cada joke)
  handleVote(id, delta){
    this.setState(
      st => ({
        jokes: st.jokes.map(j => 
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      // despues de asignar voto a joke (a traves de setState), lo guardamos en localstorage
      // ejecutamos una funcion ( "() =>" ) asignando al item "jokes" el estado actualizado por setState
      () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  handleClick(){
    this.setState({loading: true}, this.getJokes);
  }
  render() { 
    // si loading es verdadero
    if(this.state.loading){
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      )
    }
    /* Ordenamos los jokes por votacion */
    let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Jokes</span> Project
          </h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>          
        </div>         
        <div className="JokeList-jokes">
          {jokes.map(j => (
            <Joke 
              key={j.id} 
              votes={j.votes} 
              text={j.text} 
              upvote={() => this.handleVote(j.id, 1)} 
              downvote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div> 
      </div>
    );
  }
}
 
export default JokeList;