import gymnasium as gym
from stable_baselines3 import PPO
import time
# load the saved model
model = PPO.load("ppo_cartpole")
 
 
# create environment
env = gym.make('CartPole-v1', render_mode="human")
# reset the environment, 
# returns an initial state
(state,_)=env.reset()
# states are
# cart position, cart velocity 
# pole angle, pole angular velocity
done = False

steps = 0

while not done:
    steps += 1
    
    action, _ = model.predict(state)

    state, reward, done, truncated, _ = env.step(action)

print("Survived steps:", steps)