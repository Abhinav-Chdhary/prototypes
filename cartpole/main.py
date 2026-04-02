import gymnasium as gym
import numpy as np
import time
 
 
# create environment
env = gym.make('CartPole-v1')
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
    
    cart_position, cart_velocity, pole_angle, pole_angular_velocity = state
    if pole_angle > 0 and pole_angular_velocity > 0:
        action = 1
    elif pole_angle < 0 and pole_angular_velocity < 0:
        action = 0
    else:
        if pole_angle > 0:
            action = 0
        else:
            action = 1


    state, reward, done, truncated, _ = env.step(action)

print("Survived steps:", steps)