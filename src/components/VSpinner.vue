<template>
  <div class="spinner"></div>
</template>

<style>
.spinner {
  width: 4rem;
  height: 4rem;
  margin: 3rem auto;
  background-color: #666;

  border-radius: 100%;  
  -webkit-animation: sk-scaleout 0.7s infinite ease-in-out;
  animation: sk-scaleout 0.7s infinite ease-in-out;
}

@-webkit-keyframes sk-scaleout {
  0% { -webkit-transform: scale(0) }
  100% {
    -webkit-transform: scale(1.0);
    opacity: 0;
  }
}

@keyframes sk-scaleout {
  0% { 
    -webkit-transform: scale(0);
    transform: scale(0);
  } 100% {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
    opacity: 0;
  }
}
</style>