const ibkr = require("./ibkrApi")

const authenticated = async() =>{
    try{

        const status = await ibkr.get("/iserver/auth/status");
        if(status.data.authenticated){
            return true;
        }

        //If not authenticated try to reauthenticate
        const reauth = await ibkr.post("/iserver/reauthenticate"        );
        if (reauth.data.success){
            return true;
        }
        return false;
    }catch(error){
        console.error("Authentication error:", error.message);
    }
}