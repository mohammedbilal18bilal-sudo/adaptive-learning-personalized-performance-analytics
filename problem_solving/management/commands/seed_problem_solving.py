from django.core.management.base import BaseCommand
from problem_solving.models import Problem

SAMPLES = [
 {"title":"Find the largest value","statement":"Given a list of numbers, find the largest value without sorting the list.","pattern":"running maximum","difficulty":1,"goal_hint":"Return the largest value in the list.","input_description":"A non-empty list of numbers.","output_description":"One number: the maximum value.","constraints":"Consider one item, negative numbers, and repeated maximum values.","decomposition_hint":"Start with a candidate; inspect each remaining number; update the candidate when needed.","state_hint":"Keep the largest value seen so far.","decision_hint":"If the current number is greater than the saved maximum, replace it.","verification_hint":"Try [10, 2, 3], [-5, -2, -9], and [4].","transfer_problem":"A school has student records with scores. Explain how to identify the record with the highest score.","transfer_pattern":"running maximum"},
 {"title":"Count passing scores","statement":"Given a list of scores, count how many are at least 40.","pattern":"counter accumulation","difficulty":1,"goal_hint":"Return how many scores meet the threshold.","input_description":"A list of numeric scores.","output_description":"An integer count.","constraints":"The list may be empty; a score of exactly 40 passes.","decomposition_hint":"Initialize a counter; inspect every score; increment when it passes.","state_hint":"Maintain the number of passing scores so far.","decision_hint":"Check whether the score is greater than or equal to 40.","verification_hint":"Try [40, 39, 80], [], and [40, 40].","transfer_problem":"A shop needs to count products whose stock is at least a reorder threshold. Explain the same approach.","transfer_pattern":"counter accumulation"},
 {"title":"Find the cheapest product","statement":"Given product prices, identify the minimum price.","pattern":"running minimum","difficulty":2,"goal_hint":"Return the smallest price.","input_description":"A non-empty list of prices.","output_description":"One number: the minimum price.","constraints":"Consider repeated prices and prices in any order.","decomposition_hint":"Initialize from the first price; compare each remaining price; update when lower.","state_hint":"Maintain the lowest price seen so far.","decision_hint":"If the current price is less than the saved minimum, update it.","verification_hint":"Try [8, 3, 5], [2, 2, 4], and [9].","transfer_problem":"Given delivery options with different fees, explain how to choose the record with the lowest fee.","transfer_pattern":"running minimum"},
]
class Command(BaseCommand):
    help = "Create starter Problem-Solving Intelligence exercises without duplicating existing titles."
    def handle(self, *args, **options):
        created = 0
        for item in SAMPLES:
            _, was_created = Problem.objects.get_or_create(title=item["title"], defaults=item)
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Problem-solving seed complete; {created} new problems created."))
