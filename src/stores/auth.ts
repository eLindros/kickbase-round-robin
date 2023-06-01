import { ref, computed } from "vue";
import { defineStore } from "pinia";
import moment from "moment";

import axios, { type AxiosResponse } from "axios";


axios.interceptors.response.use(function (response: AxiosResponse) {
    return response;
}, function (error) {
    if (error.response && error.response.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('tokenExp')
        window.location.reload()
    }
    return Promise.reject(error);
});

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

export const useAuthStore = defineStore("auth", () => {
  let user = ref(localStorage.getItem('user'));
  let token = ref(localStorage.getItem('token'));
  let tokenExp = ref(localStorage.getItem('tokenExp'));

  const isAuthenticated = computed( () => { 
        const now = moment();
        if (
          user && token && tokenExp
        ) {
            const tokenExpMoment = moment(tokenExp.value);
            if (tokenExpMoment > now)   return true
        }
        return false
      });

  function login(password: String) {
    axios({
            'url': 'https://api.kickbase.com/user/login',
            "method": 'POST',
            'data': {
                'email': user,
                'password': password,
                'ext': true,
            }
        })
            .then((response) => {
                if (response.status === 200) {

                    if (response.data.email && response.data.token && response.data.tokenExp) {
                        user = response.data.email;
                        localStorage.setItem('user', response.data.email)
                        token = response.data.token;
                        localStorage.setItem('token', response.data.token)
                        tokenExp = response.data.tokenExp;
                        localStorage.setItem('tokenExp', response.data.tokenExp)
                    } else {
                    }
                }
            })
            .catch(function () {
            })
  }

  function logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExp')
      window.location.reload()
  }

  return { user, isAuthenticated, login, logout };
});
