# == Schema Information
#
# Table name: questions
#
#  id             :bigint(8)        not null, primary key
#  body           :string
#  interface_name :string           default("textarea")
#  watson         :boolean          default(FALSE)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

class Question < ApplicationRecord
  has_many :prompts
end
