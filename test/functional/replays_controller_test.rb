require 'test_helper'

class ReplaysControllerTest < ActionController::TestCase
  setup do
    @replay = replays(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:replays)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create replay" do
    assert_difference('Replay.count') do
      post :create, replay: { attribution: @replay.attribution, dataPath: @replay.dataPath, desc: @replay.desc, length: @replay.length, name: @replay.name, screenshotPath: @replay.screenshotPath, source: @replay.source, statusId: @replay.statusId, userId: @replay.userId }
    end

    assert_redirected_to replay_path(assigns(:replay))
  end

  test "should show replay" do
    get :show, id: @replay
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @replay
    assert_response :success
  end

  test "should update replay" do
    put :update, id: @replay, replay: { attribution: @replay.attribution, dataPath: @replay.dataPath, desc: @replay.desc, length: @replay.length, name: @replay.name, screenshotPath: @replay.screenshotPath, source: @replay.source, statusId: @replay.statusId, userId: @replay.userId }
    assert_redirected_to replay_path(assigns(:replay))
  end

  test "should destroy replay" do
    assert_difference('Replay.count', -1) do
      delete :destroy, id: @replay
    end

    assert_redirected_to replays_path
  end
end
