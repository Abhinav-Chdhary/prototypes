import gymnasium as gym
from stable_baselines3 import PPO

# create env (no render)
env = gym.make("CartPole-v1")

# create model
model = PPO("MlpPolicy", env, verbose=1)

# train
model.learn(total_timesteps=50000)

# SAVE the model (important!)
model.save("ppo_cartpole")