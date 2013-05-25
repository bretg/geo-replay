class CreateReplays < ActiveRecord::Migration
  def change
    create_table :replays, {:primary_key => :replayId} do |t|
      t.integer :replayId
      t.string :name
      t.string :desc
      t.text :source
      t.string :attribution
      t.integer :userId
      t.integer :length
      t.text :screenshotPath
      t.text :dataPath
      t.integer :statusId
      t.timestamps
    end
  end
end
