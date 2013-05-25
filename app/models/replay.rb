class Replay < ActiveRecord::Base
	validates :name, :desc, :userId, :statusId, :presence => true
  attr_accessible :replayId, :attribution, :dataPath, :desc, :length, :name, :screenshotPath, :source, :statusId, :userId
end
