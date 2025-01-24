import json
import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.db import transaction
from books.models import Book, CareerCategory, Career

class Command(BaseCommand):
    help = 'Load career books from JSON files into the database'

    def handle(self, *args, **options):
        # Clear existing data if requested
        if options['clear']:
            self.stdout.write('Clearing existing books...')
            Book.objects.all().delete()

        # Path to career books directory
        books_dir = os.path.join('books', 'career_books')
        
        # Process each JSON file in the directory
        for filename in os.listdir(books_dir):
            if filename.endswith('.json'):
                self.stdout.write(f'Processing {filename}...')
                
                # Read JSON file
                file_path = os.path.join(books_dir, filename)
                with open(file_path, 'r') as f:
                    book_data = json.load(f)
                
                try:
                    with transaction.atomic():
                        # Create or update book
                        book_info = book_data['book']
                        book, created = Book.objects.update_or_create(
                            associated_gift=book_info['associated_gift'],
                            defaults={
                                'title': book_info['title'],
                                'subtitle': book_info['subtitle'],
                                'slug': slugify(book_info['title']),
                                'publication_info': book_info['publication_info'],
                                'copyright_info': book_info['copyright_info'],
                                'version': book_info['version']
                            }
                        )
                        
                        action = 'Created' if created else 'Updated'
                        self.stdout.write(self.style.SUCCESS(
                            f'{action} book: {book.title}'
                        ))

                        # Delete existing categories and careers for this book
                        book.categories.all().delete()

                        # Process categories
                        for cat_data in book_info['categories']:
                            category = CareerCategory.objects.create(
                                book=book,
                                order=cat_data['order'],
                                title=cat_data['title'],
                                description=cat_data['description'],
                                slug=slugify(cat_data['title'])
                            )
                            
                            # Process careers in category
                            for career_data in cat_data['careers']:
                                career = Career.objects.create(
                                    category=category,
                                    title=career_data['title'],
                                    description=career_data.get('description', ''),
                                    possibility_rating=career_data['possibility_rating'],
                                    order=career_data['order']
                                )
                                
                                # Process specializations if they exist
                                if 'specializations' in career_data:
                                    for spec_data in career_data['specializations']:
                                        Career.objects.create(
                                            category=category,
                                            title=spec_data['title'],
                                            parent=career,
                                            possibility_rating=career.possibility_rating,
                                            order=spec_data['order']
                                        )

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error processing {filename}: {str(e)}')
                    )
                    continue

        self.stdout.write(self.style.SUCCESS('Book loading completed!'))

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing books before loading',
        ) 