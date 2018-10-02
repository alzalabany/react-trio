import React, { Component } from 'react';
import {withCore} from 'react-trio';

class LoginScreen extends Component {
  state = {loading:false};
  username = React.createRef();
  password = React.createRef();

  componentDidMount(){
    this.props.listen('LOADING_START',()=>this.setState({loading:true}));
    this.props.listen('LOADING_END',()=>this.setState({loading:false}));

    this.props.listen('LOGIN_FAILED',(error)=>this.setState({error}));
  }

  componentWillUnmount(){
    this.remove.map(fn=>fn()); // remove all listeners
  }

  attemptLogin = (e) => {
    e.preventDefault();

    // validate on action, for max code sharing keep ui for ui only.

    this.props.emit(
                    'LOGIN_ATTEMPT',
                    { username: this.username.current.value,
                      password: this.password.current.value
                    });
  }

  render(){
    return <form onSubmit={this.attemptLogin}>

      {this.state.loading && <label>please wait.. loading</label>}

      {this.state.error && <label>ops :(, {error.message}</label>}

      <input type="text" ref={this.username} placeholder="username" />

      <input type="text" ref={this.password} placeholder="password" />

      <input type="submit" />

      </form>
  }

export default withCore(LoginScreen);