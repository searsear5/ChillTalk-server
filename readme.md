
if(token){
    try{
        const decodeToken = jwtDecode(token)
        const currentTime = Date.now()/1000

        if(decodeToken.exp < currentTime){

            rounter.push('/login')

        }  
    }
    catch(err){
      console.log(err)
    }
}

